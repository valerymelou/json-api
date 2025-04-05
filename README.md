# JSON:API Library

[![CI Build](https://img.shields.io/github/actions/workflow/status/vmelou/jsonapi/ci.yml?branch=main&label=build)](https://github.com/vmelou/jsonapi/actions/workflows/ci.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b41cc3a8a2b1654f2b4a/test_coverage)](https://codeclimate.com/github/valerymelou/json-api/test_coverage)
[![License: MIT](https://img.shields.io/npm/l/@vmelou/jsonapi)](https://opensource.org/licenses/MIT)

A TypeScript implementation of the [JSON:API](https://jsonapi.org/) specification. This monorepo contains the following packages:

- [@vmelou/jsonapi](libs/jsonapi/core/README.md) - Core library for serializing and deserializing JSON:API data
- [@vmelou/jsonapi-angular](libs/jsonapi/angular/README.md) - Angular integration with HttpClient and RxJS support

## Features

### Core Library (@vmelou/jsonapi)

- Serialize TypeScript classes to JSON:API compliant objects
- Deserialize JSON:API responses into TypeScript class instances
- Support for relationships and included resources
- Handles primitive types and Date objects
- Support for collection responses with pagination
- Error handling with JSON:API error objects

### Angular Integration (@vmelou/jsonapi-angular)

- Complete integration with Angular's HttpClient
- RxJS Observables for all API operations
- Support for CRUD operations (Create, Read, Update, Delete)
- List operations with pagination and filtering
- Error handling with JSON:API error objects
- TypeScript type safety

## Quick Start

### Core Library

```bash
npm install @vmelou/jsonapi
```

### Angular Integration

```bash
npm install @vmelou/jsonapi @vmelou/jsonapi-angular
```

## Documentation

- [Core Library Documentation](libs/jsonapi/core/README.md)
- [Angular Integration Documentation](libs/jsonapi/angular/README.md)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more details on how to get involved.

## Changelog

Detailed changes for each release are documented in the [CHANGELOG.md](CHANGELOG.md) file.

## License

MIT
