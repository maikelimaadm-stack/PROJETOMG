# 03 — Public Interfaces

**Foundation C.0** · TypeScript-style interfaces — **no implementation**

> Naming convention: `I*` prefix for interfaces, `*Port` for hexagonal boundaries. Shapes derive from UEC ([UP-02](../platform-protocol/02-UNIVERSAL-EXECUTION-CONTEXT.md)) and PA-02.

---

## 1. Core

### IRuntimeBootstrap

```typescript
interface IRuntimeBootstrap {
  bootstrap(config: BootstrapConfig): Promise<RuntimeInstance>;
  hydrate(instance: RuntimeInstance, crbRef: CrbReference): Promise<HydratedRuntime>;
  destroy(instance: RuntimeInstance): Promise<void>;
}

interface BootstrapConfig {
  host: 'web' | 'mobile' | 'desktop' | 'embedded';
  tenantId: string;
  applicationId: string;
  environment: 'dev' | 'staging' | 'prod';
  apiBaseUrl: string;
}
```

### IRuntimeContext

```typescript
interface IRuntimeContext {
  readonly tenantId: string;
  readonly userId: string;
  readonly traceId: string;
  readonly locale: string;
  readonly accessScope: AccessScope;
  readonly selectedCompanyId?: string;
  child(scope: Partial<ContextScope>): IRuntimeContext;
}
```

### ISessionManager

```typescript
interface ISessionManager {
  authenticate(credentials: AuthCredentials): Promise<AccessScope>;
  refresh(): Promise<AccessScope>;
  logout(): Promise<void>;
  getAccessScope(): AccessScope | null;
}
```

### IRegistry

```typescript
type RegistryType =
  | 'entity' | 'field' | 'layout' | 'validation'
  | 'route' | 'permission' | 'action' | 'workflow'
  | 'renderer' | 'handler' | 'connector' | 'plugin';

interface IRegistry {
  register<T>(type: RegistryType, key: string, factory: RegistryFactory<T>): void;
  resolve<T>(type: RegistryType, key: string): T;
  has(type: RegistryType, key: string): boolean;
  keys(type: RegistryType): string[];
}
```

### ILoader

```typescript
interface ILoader {
  load(ref: ResourceRef): Promise<ArrayBuffer | object>;
  loadCached(ref: ResourceRef): Promise<object>;
  invalidate(ref: ResourceRef): void;
}
```

### ICrbLoader

```typescript
interface ICrbLoader {
  fetch(bundleId: string): Promise<CrbPayload>;
  verify(payload: CrbPayload): VerificationResult;
  hydrate(payload: CrbPayload, registry: IRegistry): HydrationResult;
}
```

### IDependencyResolver

```typescript
interface IDependencyResolver {
  registerModule(name: string, deps: string[]): void;
  resolveOrder(): string[];
  detectCycles(): CycleReport | null;
}
```

### IRouter

```typescript
interface IRouter {
  match(path: string): RouteMatch | null;
  navigate(to: RouteTarget, options?: NavigateOptions): Promise<void>;
  canActivate(route: RouteEntry, ctx: IRuntimeContext): Promise<boolean>;
}
```

---

## 2. Engines

### IPermissionEngine

```typescript
interface IPermissionEngine {
  can(action: string, resource: ResourceRef, ctx: IRuntimeContext): Promise<boolean>;
  filterVisible<T extends UiElement>(elements: T[], ctx: IRuntimeContext): T[];
}
```

### IActionEngine

```typescript
interface IActionEngine {
  dispatch(command: UecCommand, ctx: IRuntimeContext): Promise<UecResult>;
  bind(actionId: string, handler: ActionHandler): void;
}
```

### IWorkflowEngine

```typescript
interface IWorkflowEngine {
  start(definitionId: string, payload: object, ctx: IRuntimeContext): Promise<WorkflowInstance>;
  transition(instanceId: string, operation: UsmOperation, ctx: IRuntimeContext): Promise<WorkflowInstance>;
  getInstance(instanceId: string): Promise<WorkflowInstance | null>;
}
```

### IRenderEngine

```typescript
interface IRenderEngine {
  render(screenId: string, ctx: IRuntimeContext): RenderTree;
  registerAdapter(viewMode: ViewMode, adapter: IViewAdapter): void;
}
```

### IExpressionEngine

```typescript
interface IExpressionEngine {
  evaluate(expr: string, bindings: Record<string, unknown>): unknown;
  validate(expr: string): ValidationResult;
}
```

### IFormulaEngine

```typescript
interface IFormulaEngine {
  compute(formula: string, fieldValues: Record<string, unknown>): unknown;
  getDependencies(formula: string): string[];
}
```

### IValidationEngine

```typescript
interface IValidationEngine {
  validateSync(rules: ValidationRule[], value: unknown, ctx: IRuntimeContext): ValidationResult;
  validateAsync(rules: ValidationRule[], value: unknown, ctx: IRuntimeContext): Promise<ValidationResult>;
}
```

### IExecutionEngine

```typescript
interface IExecutionEngine {
  execute(request: UecRequest, ctx: IRuntimeContext): Promise<UecResponse>;
}
```

### IStateEngine

```typescript
interface IStateEngine {
  getState<T>(key: StateKey): T | undefined;
  setState<T>(key: StateKey, value: T): void;
  subscribe(key: StateKey, listener: StateListener): Unsubscribe;
  transition(entityRef: EntityRef, operation: UsmOperation): Promise<UsmState>;
}
```

### IPluginEngine

```typescript
interface IPluginEngine {
  load(manifest: PluginManifest): Promise<IPlugin>;
  unload(pluginId: string): Promise<void>;
  getExtensionPoint(name: string): ExtensionPoint;
}
```

### IConnectorEngine

```typescript
interface IConnectorEngine {
  invoke(connectorId: string, request: ConnectorRequest, ctx: IRuntimeContext): Promise<ConnectorResponse>;
}
```

---

## 3. Infrastructure

### IServiceLocator

```typescript
interface IServiceLocator {
  register<T>(token: ServiceToken, factory: ServiceFactory<T>, scope?: 'singleton' | 'scoped'): void;
  resolve<T>(token: ServiceToken): T;
  createScope(): IServiceLocator;
}
```

### ICache

```typescript
interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<void>;
}
```

### IEventBus

```typescript
interface IEventBus {
  publish(event: UecEvent, ctx: IRuntimeContext): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): Unsubscribe;
}
```

### ITransactionManager

```typescript
interface ITransactionManager {
  runInTransaction<T>(fn: () => Promise<T>, options?: TxOptions): Promise<T>;
}
```

### IObservability

```typescript
interface IObservability {
  startSpan(name: string, ctx: IRuntimeContext): Span;
  log(level: LogLevel, message: string, meta?: object): void;
  metric(name: string, value: number, tags?: Record<string, string>): void;
  health(): HealthReport;
}
```

---

## 4. Shared types (UEC-aligned)

```typescript
interface UecRequest {
  kind: 'command' | 'query' | 'action' | 'event';
  type: string;
  payload: unknown;
  idempotencyKey?: string;
}

interface UecResponse {
  success: boolean;
  data?: unknown;
  error?: UecError;
  events?: UecEvent[];
}

interface AccessScope {
  tenantId: string;
  userId: string;
  companies: CompanyRef[];
  permissions: string[];
  locale: string;
}
```

---

## 5. Interface ownership matrix

| Interface | Owner module | Consumers |
|-----------|--------------|-----------|
| `IRuntimeBootstrap` | M01 | Host app |
| `IRuntimeContext` | M02 | All |
| `ISessionManager` | M03 | M01, M09 |
| `IRegistry` | M04 | M05–M19 |
| `ICrbLoader` | M06 | M01, M12 |
| `IExecutionEngine` | M16 | M10, host |
| `IRenderEngine` | M12 | M08, host UI |
| `IEventBus` | M22 | M10, M16, M17 |

---

## 6. Rules

1. Interfaces are **stable contracts** — breaking changes require SSOT bump + gate.
2. No interface exposes MMM DB types (D-RI-13).
3. All async methods return `Promise` — sync only for pure evaluation (Expression/Formula).
4. FE implementations may stub BE-only interfaces (`ITransactionManager`) with no-op.

---

*Próximo: [04-MODULE-CONTRACTS](./04-MODULE-CONTRACTS.md)*
