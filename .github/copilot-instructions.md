# AI Coding Agent Instructions for Alfresco Content App (ACA) 7.1 Fork

## Project Overview

This is a **fork of Alfresco Content Application (ACA 7.1.x) customized for MRBau** with custom extensions. It's an Angular 19 monorepo using **Nx** for workspace management. The application integrates with Alfresco Content Services (ACS) and provides a modular plugin system for extensions.

**Key Stack:** Angular 19, Nx 21.3.7, RxJS, NgRx, TypeScript 5.8.2, Node 22.x

### Repository Structure

- **`app/`** - Main ACA application (content-ce). Entry point at `app/src/main.ts`, routes at `app/src/app/app.routes.ts`
- **`projects/`** - Extension libraries (monorepo packages):
  - `mrbau-extension/` - Main MRBau custom features (tasks, documents, settings, PDF preview)
  - `mrbau-common/` - Shared MRBau services and models
  - `mrbau-smarttable/` - Smart table components for tasks/docs
  - `aca-shared/` - ACA shared services (AppService, RouterExtensionService, state management)
  - `aca-content/` - Core ACA content modules (folder-rules, ms-office plugins, about)

## Architecture Patterns

### 1. Extension/Plugin System (ADF ExtensionService)

Extensions are **modular libraries** loaded dynamically at runtime. Each extension must:

1. **Create a provider function** (e.g., `provideMrbauExtensionExtension()`) that returns `(Provider | EnvironmentProviders)[]`
2. **Register components** via `provideExtensions({ components: {...} })`
3. **Define routes** via `provideExtensionConfig(['extension-name.json'])` with JSON manifests in `descriptor/` folder
4. **Register evaluators** (rule functions) via `provideExtensions({ evaluators: {...} })`

Example from `projects/mrbau-extension/src/lib/mrbau-extension.module.ts`:
```typescript
export function provideMrbauExtensionExtension(): (Provider | EnvironmentProviders)[] {
  return [
    provideTranslations('mrbau-extension', 'assets/mrbau-extension'),
    provideExtensionConfig(['mrbau-extension.json']),
    provideEffects(MrbauEffects),
    provideExtensions({
      components: {
        'mrbau-extension.main.component': MrbauExtensionMainComponent,
        'mrbau-extension.tasks.component': TaskMainComponent,
      },
      evaluators: {
        'mrbau-extension.disabled': () => !mrbauExtensionService.mrbauExtensionEnabled(),
      }
    })
  ];
}
```

**Bootstrap:** Extensions are **composed in `app/src/app/extensions.module.ts`** via `provideApplicationExtensions()`.

### 2. Service Pattern (Dependency Injection)

Services are **Injectable singletons** with `providedIn: 'root'`. Use **constructor injection** with typed parameters:

```typescript
@Injectable({ providedIn: 'root' })
export class MrbauCommonService {
  constructor(
    private store: Store<AppStore>,
    private contentApiService: ContentApiService,
    private alfrescoApiService: AlfrescoApiService
  ) {}
}
```

**Data access:** Services wrap ADF APIs (NodesApi, SearchService, CommentsApi) via lazy-loaded getters to initialize Alfresco API instances on demand.

### 3. NgRx State Management

The app uses **NgRx for global state** with the `AppStore` type. Services interact with store via:
```typescript
this.store.select(selector); // read state
this.store.dispatch(new Action()); // update state
```

Effects handle side effects and async operations. Check `projects/mrbau-extension/src/lib/store/mrbau.effects.ts` for patterns.

### 4. Dynamic Component Registration

Components are registered by string ID and used in JSON plugin manifests:
```typescript
extensionService.setComponents({
  'mrbau-extension.pdf-viewer': PdfPreviewComponent
});
```

Then referenced in `descriptor/mrbau-extension.json`:
```json
{
  "routes": [{ "component": "mrbau-extension.pdf-viewer" }]
}
```

## Build & Development Workflow

### Common Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Dev server on port 4200 with hot reload |
| `npm run build` | Production build to `dist/content-ce/` |
| `npm run build.release` | Release build with special configuration |
| `npm run build:mrbau-extension` | Build MRBau extension library + copy assets |
| `npm run lint` | ESLint across all projects (Node: 4GB) |
| `npm test` | Run Karma tests |
| `npm run affected:build` | Build only changed projects |
| `nx build @mrbau/mrbau-extension` | Build specific library |

### Environment Configuration

Create `.env` file in project root:
```yaml
BASE_URL="https://mrdev01.mrbau.local"  # ACS instance URL
```

The app loads config from `app/src/app.config.json` at startup.

### Nx Caching

The workspace uses **Nx computation caching** (`nxcache/` directory). Reset cache with:
```bash
npx nx reset
rm -rf .nx/cache node_modules/.cache/nx
```

## Key Conventions & Patterns

### 1. File Naming

- **Services:** `*.service.ts` (e.g., `mrbau-common.service.ts`)
- **Components:** `*.component.ts` with matching `.html` and `.scss`
- **Modules/Providers:** `*.module.ts` (newer code uses provider functions instead of modules)
- **Plugin descriptors:** `descriptor/*.json` (e.g., `descriptor/mrbau-extension.json`)
- **Declarations/Models:** `declaration/*.ts` or `models/` (e.g., `mrbau-task-declarations.ts`)

### 2. Module Organization in mrbau-extension

```
projects/mrbau-extension/src/lib/
  ├── components/         # Smart components (container logic)
  ├── dialogs/           # Modal dialogs
  ├── services/          # Business logic & data access
  ├── declaration/       # TypeScript interfaces & enums
  ├── store/             # NgRx actions, effects, reducers
  ├── descriptor/        # Extension manifest JSON
  └── assets/            # Translations, icons, static files
```

### 3. Lazy Load Getters for APIs

Instead of initializing APIs in constructor, use lazy getters to defer initialization:
```typescript
private _nodesApi: NodesApi | undefined;
get nodesApi(): NodesApi {
  if (!this._nodesApi) {
    this._nodesApi = new NodesApi(this.alfrescoApiService.getInstance());
  }
  return this._nodesApi;
}
```

### 4. Async Patterns

- Use **RxJS Observables** with async pipe in templates
- Use **async/await** in service methods for sequential operations
- Share observables with `shareReplay()` to avoid redundant API calls
- Dispatch NgRx actions for side effects, subscribe to effects for async operations

### 5. Localization

- Translation keys live in `assets/{project-name}/` JSON files
- Register in module via `provideTranslations('project-name', 'assets/project-name')`
- Use `{{ key | translate }}` in templates or `translateService.get('key')` in code

### 6. Dialogs & Material Modals

Use **MatDialog** for modals. Pass data via `data` property:
```typescript
this.dialog.open(ConfirmTaskDialog, {
  data: { taskId: '123', title: 'Confirm?' },
  width: '600px'
});
```

Access injected data via `MAT_DIALOG_DATA`:
```typescript
constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmTaskData) {}
```

## Cross-Component Communication

### 1. Services (Recommended)
- Use injected services with Subjects/Observables for loosely coupled updates
- Example: `MrbauCommonService` exposes data via public observables

### 2. NgRx Store
- Global state for features that span multiple routes/components
- Use selectors to derive computed values, effects for async operations

### 3. Router State
- Pass data via `ActivatedRoute.snapshot.queryParams` or route `data` property
- Example: `this.route.snapshot.queryParams['nodeId']`

### 4. Dialog Data
- Use MatDialog's `data` property for modal communication
- Return result via `dialogRef.close(result)`

## Testing Approach

- **Unit tests:** Karma + Jasmine with `TestBed.configureTestingModule()`
- **Mock providers:** Use `provideMockStore()` for NgRx state tests
- **Component specs:** Import `LibTestingModule` for base setup
- **E2E tests:** Playwright in `e2e/playwright/`

Test exclusion in build: `!{projectRoot}/**/*.spec.[jt]s`

## Important File References

| File | Purpose |
|------|---------|
| `app/src/app/app.config.ts` | Application configuration (providers, routes) |
| `app/src/app/extensions.module.ts` | Compose all extensions |
| `projects/mrbau-extension/src/lib/mrbau-extension.module.ts` | MRBau extension provider setup |
| `projects/aca-shared/src/lib/services/router.extension.service.ts` | Route extension mapping |
| `projects/aca-shared/src/lib/services/app.extension.service.ts` | Extension orchestration |
| `extension.schema.json` | Schema for plugin manifest files |
| `nx.json` | Nx workspace config (caching, targets) |

## Common Pitfalls

1. **Circular imports:** Use barrel exports (`index.ts`) in `projects/*/src/public-api.ts`
2. **Missing providers:** Extensions must provide dependencies (not just import modules)
3. **Stale Nx cache:** Use `npx nx reset` after major changes
4. **Component registration:** Must be registered before route references in JSON manifests
5. **Store state types:** Always type `Store<AppStore>` for consistency across extensions
6. **Lazy-initialized APIs:** Don't initialize Alfresco APIs in service constructors; use getter pattern

## Recommended Reading

- `CONTRIBUTING.md` - PR guidelines, CLA requirements
- `docs/extending/redistributable-libraries.md` - Extension creation guide
- `docs/tutorials/how-to-create-your-first-extension.md` - Step-by-step extension tutorial
- `package.json` - Available npm scripts and dependency versions
