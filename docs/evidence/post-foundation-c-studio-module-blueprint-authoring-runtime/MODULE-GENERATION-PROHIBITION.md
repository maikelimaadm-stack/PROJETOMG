# Module Generation Prohibition

The runtime generates NO module and writes NO module files. Capability flags:
`moduleGenerated:false`, `filesWrittenToModule:false`, `moduleRegistered:false`. There is no
`src/modules/studio`, no production registry touch, no marketplace, no publication.

The invariant enforcer additionally blocks any draft that declares module-generation authorization
(`no_module_generation_authorization`).
