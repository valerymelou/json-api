# Contributing to @vmelou/jsonapi

We love your input! We want to make contributing to the @vmelou/jsonapi libraries as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Pull Request Process

1. Update the README.md of the affected library with details of changes to the interface, if applicable
2. Update the CHANGELOG.md with a note describing your changes under the appropriate package section
3. The PR will be merged once you have the sign-off of at least one other developer

## Any Contributions You Make Will Be Under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report Bugs Using GitHub's [Issue Tracker](https://github.com/vmelou/jsonapi/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/vmelou/jsonapi/issues/new); it's that easy!

## Write Bug Reports With Detail, Background, and Sample Code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Running Tests

For the core library:

```bash
yarn nx test jsonapi-core
```

For the Angular library:

```bash
yarn nx test jsonapi-angular
```

## Coding Style

- TypeScript with strict type checking
- 2 spaces for indentation
- Run `yarn nx lint jsonapi-core` or `yarn nx lint jsonapi-angular` to ensure your changes follow our style guidelines

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
