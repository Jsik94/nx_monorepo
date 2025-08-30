# Project Monorepo

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

A modern monorepo workspace powered by [Nx](https://nx.dev) for building scalable applications and libraries.

## 📋 Projects Overview

This monorepo contains:

- **Frontend Applications**: React/TypeScript based web applications
- **Backend Services**: Node.js/NestJS based API services  
- **Shared Libraries**: Common utilities and components
- **Documentation**: PRDs and development guides

## 🛠 Environment

### DevContainer Environment

This project uses a DevContainer with the following pre-configured tools:

| Tool            | Version  |
| --------------- | -------- |
| Package manager | pnpm     |
| Node.js         | v22.17.0 |
| pnpm            | v10.14.0 |
| Nx              | v21.4.0  |
| Docker          | Latest   |
| Git             | Latest   |

### System Requirements

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher
- **Docker**: For DevContainer support
- **VS Code**: Recommended for best development experience

## 🚀 Getting Started

### 1. Environment Setup

#### Option A: DevContainer (Recommended)
```bash
# Open in VS Code with DevContainer extension
code .
# VS Code will prompt to reopen in container
```

#### Option B: Local Development
```bash
# Install dependencies
pnpm install

# Verify Nx installation
npx nx --version
```

### 2. Explore the Workspace

```bash
# View project graph
npx nx graph

# List all projects
npx nx show projects

# Show project details
npx nx show project <project-name>
```

### 3. Development Commands

```bash
# Serve a specific application
pnpm nx serve <app-name>

# Build a specific project
pnpm nx build <project-name>

# Run tests
pnpm nx test <project-name>

# Lint code
pnpm nx lint <project-name>
```

## 📁 Workspace Structure

```
.
├── apps/                    # Applications
│   ├── sample-project/      # Sample project applications
│   │   ├── fe-board/        # React blog platform
│   │   └── be-sample/       # Backend API service
│   └── ...
├── libs/                    # Shared libraries
├── tools/                   # Development tools and scripts
├── docs/                    # Documentation
├── .devcontainer/           # DevContainer configuration
├── nx.json                  # Nx workspace configuration
├── package.json             # Root package.json
└── pnpm-workspace.yaml      # pnpm workspace configuration
```

## 🎯 Quick Start Examples

### Frontend Development (Blog Platform)
```bash
# Start the React blog application
pnpm nx serve fe-board

# Build for production
pnpm nx build fe-board

# Run tests
pnpm nx test fe-board
```

### Backend Development (API Service)
```bash
# Start the backend API server
pnpm nx serve be-sample

# Build the service
pnpm nx build be-sample

# Run API tests
pnpm nx test be-sample
```

### Workspace Management
```bash
# Install dependencies for all projects
pnpm install

# Build all projects
pnpm nx run-many --target=build --all

# Test all projects
pnpm nx run-many --target=test --all

# Lint all projects
pnpm nx run-many --target=lint --all
```

## 📊 Project Status

| Project | Type | Status | Description |
|---------|------|--------|-------------|
| fe-board | Frontend | 🚧 In Development | React blog platform with shadcn/ui |
| be-sample | Backend | ✅ Ready | NestJS API service |

## 🔧 Development Workflow

### 1. Feature Development
```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Make your changes and test
pnpm nx affected:test
pnpm nx affected:lint

# Build affected projects
pnpm nx affected:build
```

### 2. Code Quality
```bash
# Format code
pnpm nx format:write

# Check formatting
pnpm nx format:check

# Run affected tests only
pnpm nx affected:test
```

### 3. Dependency Management
```bash
# Add dependency to specific project
pnpm --filter fe-board add react-query

# Add dev dependency
pnpm --filter fe-board add -D @types/node

# Update dependencies
pnpm update
```

## 🚀 Deployment

### Remote Caching Setup
[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/3A0bofVi4G)

### CI/CD Integration
This workspace is configured for:
- **GitHub Actions**: Automated testing and building
- **Nx Cloud**: Distributed task execution and caching
- **Docker**: Containerized deployments

## 🏗 Adding New Projects

### Generate Applications
```bash
# React application
pnpm nx g @nx/react:app my-react-app

# Node.js application  
pnpm nx g @nx/node:app my-node-app

# NestJS application
pnpm nx g @nx/nest:app my-nest-app
```

### Generate Libraries
```bash
# React component library
pnpm nx g @nx/react:lib my-ui-lib

# TypeScript utility library
pnpm nx g @nx/js:lib my-utils-lib

# Node.js library
pnpm nx g @nx/node:lib my-node-lib
```

### Available Generators
```bash
# List all available plugins
pnpm nx list

# List generators for specific plugin
pnpm nx list @nx/react
pnpm nx list @nx/nest
pnpm nx list @nx/node
```

## 🛠 Development Tools

### Nx Console (Recommended)
Nx Console provides a graphical interface for running commands and generating code:

- **VS Code**: [Install Nx Console Extension](https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console)
- **IntelliJ**: [Install Nx Console Plugin](https://plugins.jetbrains.com/plugin/21060-nx-console)

### Useful Commands
```bash
# Interactive project generator
pnpm nx g

# Visualize project dependencies
pnpm nx graph

# Analyze bundle size
pnpm nx build --stats-json
```

## 📚 Documentation

### Project-Specific Documentation
- **[fe-board](./apps/sample-project/fe-board/prd/)**: React blog platform PRD and tasks
- **[be-sample](./apps/sample-project/be-sample/)**: Backend API documentation

### External Resources
- **[Nx Documentation](https://nx.dev)**: Official Nx documentation
- **[Nx Recipes](https://nx.dev/recipes)**: Common patterns and solutions
- **[Nx Blog](https://nx.dev/blog)**: Latest updates and best practices

## 🤝 Contributing

### Development Guidelines
1. **Follow the established project structure**
2. **Use conventional commit messages**
3. **Write tests for new features**
4. **Update documentation as needed**
5. **Run linting and formatting before commits**

### Code Quality Standards
```bash
# Before committing
pnpm nx affected:lint
pnpm nx affected:test
pnpm nx affected:build
pnpm nx format:check
```

## 📞 Support & Community

### Nx Community
- **[Discord](https://go.nx.dev/community)**: Community discussions
- **[GitHub](https://github.com/nrwl/nx)**: Issues and contributions
- **[Twitter](https://twitter.com/nxdevtools)**: Latest updates
- **[YouTube](https://www.youtube.com/@nxdevtools)**: Tutorials and talks

### Getting Help
- **[Nx Documentation](https://nx.dev)**: Comprehensive guides
- **[Stack Overflow](https://stackoverflow.com/questions/tagged/nrwl-nx)**: Q&A with nx tag
- **[GitHub Issues](https://github.com/nrwl/nx/issues)**: Bug reports and feature requests

---

**Made with ❤️ using [Nx](https://nx.dev)**
