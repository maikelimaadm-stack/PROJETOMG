import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { MMM_ENVELOPE_VERSION, PLATFORM_SCHEMA_COUNT } from "./mmmConstants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SPEC_ROOT = path.resolve(__dirname, "../../../../docs/meta-model/spec");

const SCHEMA_ID_PREFIX = "https://schema.mak.platform/mmm/v1";

let registryPromise = null;

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const schemaIdForFile = (absPath) => {
  const rel = path.relative(SPEC_ROOT, absPath).replaceAll("\\", "/");
  if (rel === "mmm-envelope-v1.schema.json") return `${SCHEMA_ID_PREFIX}/envelope`;
  if (rel === "schemas/_definitions.schema.json") return `${SCHEMA_ID_PREFIX}/_definitions`;
  if (rel.startsWith("schemas/profiles/")) {
    const name = path.basename(rel, ".schema.json").replace(/^profile-[a-z]-/, "");
    return `${SCHEMA_ID_PREFIX}/profiles/${name}`;
  }
  if (rel.startsWith("schemas/types/")) {
    const objectType = path.basename(rel, ".schema.json");
    return `${SCHEMA_ID_PREFIX}/payload/${objectType}`;
  }
  return `${SCHEMA_ID_PREFIX}/${rel.replace(/\.schema\.json$/, "").replace(/\//g, "-")}`;
};

const normalizeRefs = (node, fileDir, ajv, loaded) => {
  if (node == null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item) => normalizeRefs(item, fileDir, ajv, loaded));
    return;
  }
  if (typeof node.$ref === "string" && !node.$ref.startsWith("#") && !node.$ref.startsWith("http")) {
    const [refPath, hash = ""] = node.$ref.split("#");
    const absRef = path.resolve(fileDir, refPath);
    const targetId = loadSchemaFile(absRef, ajv, loaded);
    node.$ref = `${targetId}${hash ? `#${hash}` : ""}`;
  }
  for (const value of Object.values(node)) {
    normalizeRefs(value, fileDir, ajv, loaded);
  }
};

const loadSchemaFile = (absPath, ajv, loaded) => {
  const normalized = path.normalize(absPath);
  if (loaded.has(normalized)) return loaded.get(normalized);

  const schema = readJson(normalized);
  const schemaId = schema.$id || schemaIdForFile(normalized);
  schema.$id = schemaId;
  loaded.set(normalized, schemaId);

  normalizeRefs(schema, path.dirname(normalized), ajv, loaded);
  ajv.addSchema(schema, schemaId);
  return schemaId;
};

const walkSchemaFiles = (dir) => {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkSchemaFiles(full));
    else if (entry.name.endsWith(".schema.json")) files.push(full);
  }
  return files;
};

const buildRegistry = () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false, validateSchema: false });
  addFormats(ajv);

  const manifest = readJson(path.join(SPEC_ROOT, "object-type-manifest.json"));
  const loaded = new Map();

  loadSchemaFile(path.join(SPEC_ROOT, "schemas/_definitions.schema.json"), ajv, loaded);
  for (const file of walkSchemaFiles(path.join(SPEC_ROOT, "schemas/profiles"))) {
    loadSchemaFile(file, ajv, loaded);
  }
  for (const file of walkSchemaFiles(path.join(SPEC_ROOT, "schemas/types"))) {
    loadSchemaFile(file, ajv, loaded);
  }
  loadSchemaFile(path.join(SPEC_ROOT, "mmm-envelope-v1.schema.json"), ajv, loaded);

  const envelopeValidator = ajv.getSchema(`${SCHEMA_ID_PREFIX}/envelope`);
  const payloadValidators = new Map();
  const objectTypeSet = new Set();

  for (const entry of manifest.objectTypes) {
    if (!entry.platformSchema) continue;
    objectTypeSet.add(entry.objectType);
    const schemaId = `${SCHEMA_ID_PREFIX}/payload/${entry.objectType}`;
    const validator = ajv.getSchema(schemaId);
    if (!validator) {
      throw new Error(`Missing compiled validator for objectType '${entry.objectType}' (${schemaId})`);
    }
    payloadValidators.set(entry.objectType, validator);
  }

  if (manifest.platformSchemaCount !== PLATFORM_SCHEMA_COUNT) {
    throw new Error(
      `Manifest platformSchemaCount=${manifest.platformSchemaCount} expected ${PLATFORM_SCHEMA_COUNT}`
    );
  }
  if (payloadValidators.size !== PLATFORM_SCHEMA_COUNT) {
    throw new Error(`Compiled ${payloadValidators.size} payload validators, expected ${PLATFORM_SCHEMA_COUNT}`);
  }

  return {
    ajv,
    manifest,
    envelopeValidator,
    payloadValidators,
    objectTypeSet,
    specRoot: SPEC_ROOT,
  };
};

export const getMmmSchemaRegistry = async () => {
  if (!registryPromise) registryPromise = Promise.resolve(buildRegistry());
  return registryPromise;
};

export const getSchemaForObjectType = async (objectType) => {
  const registry = await getMmmSchemaRegistry();
  const entry = registry.manifest.objectTypes.find((item) => item.objectType === objectType);
  if (!entry) return null;
  const absPath = path.join(SPEC_ROOT, entry.schemaPath);
  return readJson(absPath);
};

export const getManifestSummary = async () => {
  const registry = await getMmmSchemaRegistry();
  return {
    manifestVersion: registry.manifest.manifestVersion,
    specVersion: registry.manifest.specVersion,
    platformSchemaCount: registry.manifest.platformSchemaCount,
    taxonomyCount: registry.manifest.taxonomyCount,
    envelopeVersion: MMM_ENVELOPE_VERSION,
    objectTypes: registry.manifest.objectTypes.map((entry) => ({
      objectType: entry.objectType,
      group: entry.group,
      profile: entry.profile,
      schemaVersion: entry.schemaVersion,
      platformSchema: entry.platformSchema,
    })),
  };
};
