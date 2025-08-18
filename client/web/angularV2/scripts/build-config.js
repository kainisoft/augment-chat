const fs = require('fs');
const path = require('path');

class BuildConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, '../angular.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      console.error('Failed to load angular.json:', error);
      process.exit(1);
    }
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('✅ Configuration updated successfully');
    } catch (error) {
      console.error('Failed to save angular.json:', error);
      process.exit(1);
    }
  }

  enableSourceMaps(projectName = null) {
    const projects = projectName ? [projectName] : Object.keys(this.config.projects);
    
    projects.forEach(project => {
      if (this.config.projects[project]?.architect?.build?.configurations) {
        const configurations = this.config.projects[project].architect.build.configurations;
        
        // Update development configuration
        if (configurations.development) {
          configurations.development.sourceMap = {
            scripts: true,
            styles: true,
            vendor: true
          };
          configurations.development.namedChunks = true;
          configurations.development.vendorChunk = true;
        }
        
        // Add debug configuration
        configurations.debug = {
          ...configurations.development,
          sourceMap: {
            scripts: true,
            styles: true,
            vendor: true,
            hidden: false
          },
          buildOptimizer: false,
          optimization: false
        };
        
        console.log(`✅ Source maps enabled for ${project}`);
      }
    });
  }

  enableHMR(projectName = null) {
    const projects = projectName ? [projectName] : Object.keys(this.config.projects);
    
    projects.forEach(project => {
      if (this.config.projects[project]?.architect?.serve) {
        const serveConfig = this.config.projects[project].architect.serve;
        
        // Add HMR options
        serveConfig.options = serveConfig.options || {};
        serveConfig.options.hmr = true;
        
        // Update configurations
        if (serveConfig.configurations) {
          if (serveConfig.configurations.development) {
            serveConfig.configurations.development.hmr = true;
          }
          
          // Add HMR-specific configuration
          serveConfig.configurations.hmr = {
            buildTarget: `${project}:build:development`,
            hmr: true
          };
        }
        
        console.log(`✅ HMR enabled for ${project}`);
      }
    });
  }

  addBundleAnalyzer(projectName = null) {
    const projects = projectName ? [projectName] : Object.keys(this.config.projects);
    
    projects.forEach(project => {
      if (this.config.projects[project]?.architect?.build?.configurations) {
        const configurations = this.config.projects[project].architect.build.configurations;
        
        // Add analyze configuration
        configurations.analyze = {
          ...configurations.production,
          statsJson: true,
          namedChunks: true
        };
        
        console.log(`✅ Bundle analyzer configuration added for ${project}`);
      }
    });
  }

  optimizeForDevelopment() {
    console.log('🔧 Optimizing build configuration for development...');
    
    this.enableSourceMaps();
    this.enableHMR();
    this.addBundleAnalyzer();
    
    console.log('✅ Development optimization complete');
  }

  optimizeForProduction() {
    console.log('🚀 Optimizing build configuration for production...');
    
    const projects = Object.keys(this.config.projects);
    
    projects.forEach(project => {
      if (this.config.projects[project]?.architect?.build?.configurations?.production) {
        const prodConfig = this.config.projects[project].architect.build.configurations.production;
        
        // Optimize production build
        prodConfig.optimization = true;
        prodConfig.outputHashing = 'all';
        prodConfig.extractLicenses = true;
        prodConfig.sourceMap = {
          scripts: false,
          styles: false,
          vendor: false,
          hidden: true
        };
        prodConfig.namedChunks = false;
        prodConfig.vendorChunk = true;
        prodConfig.buildOptimizer = true;
        
        console.log(`✅ Production optimization applied to ${project}`);
      }
    });
    
    console.log('✅ Production optimization complete');
  }
}

// CLI interface
const command = process.argv[2];
const project = process.argv[3];

const manager = new BuildConfigManager();

switch (command) {
  case 'dev':
    manager.optimizeForDevelopment();
    manager.saveConfig();
    break;
  case 'prod':
    manager.optimizeForProduction();
    manager.saveConfig();
    break;
  case 'sourcemaps':
    manager.enableSourceMaps(project);
    manager.saveConfig();
    break;
  case 'hmr':
    manager.enableHMR(project);
    manager.saveConfig();
    break;
  case 'analyzer':
    manager.addBundleAnalyzer(project);
    manager.saveConfig();
    break;
  default:
    console.log(`
Usage: node build-config.js <command> [project]

Commands:
  dev       - Optimize for development (sourcemaps, HMR, analyzer)
  prod      - Optimize for production
  sourcemaps - Enable source maps for project(s)
  hmr       - Enable HMR for project(s)
  analyzer  - Add bundle analyzer configuration

Examples:
  node build-config.js dev
  node build-config.js sourcemaps chat-app
  node build-config.js hmr
    `);
}