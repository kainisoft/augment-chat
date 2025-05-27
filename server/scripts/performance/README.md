# Performance Monitoring System

Comprehensive performance analysis tools for shared infrastructure modules in the chat application microservices architecture.

## Overview

This performance monitoring system provides detailed insights into the performance characteristics of shared infrastructure modules (`@app/validation`, `@app/dtos`, `@app/security`, `@app/testing`) across all microservices.

## Available Tools

### 1. Performance Baseline (`establish-baseline.ts`)

**Purpose**: Establishes a comprehensive performance baseline by running all monitoring utilities.

**Usage**:
```bash
pnpm perf:baseline
```

**What it measures**:
- Bundle sizes and compression ratios
- Memory usage patterns and leak detection
- Response times for validation, security, and DTO operations
- Build performance across all services
- Shared module impact analysis

**Output**:
- `performance-baseline-{timestamp}.json` - Complete baseline data
- `baseline-summary-{timestamp}.md` - Human-readable summary report

### 2. Performance Monitor (`performance-monitor.ts`)

**Purpose**: General performance monitoring and shared module impact analysis.

**Usage**:
```bash
pnpm perf:monitor
```

**What it measures**:
- Bundle sizes for each microservice
- Build times and compilation performance
- Shared module usage frequency
- Memory baseline metrics
- Decorator, DTO, utility, and mock counts

**Output**:
- `performance-baseline-{timestamp}.json` - Detailed metrics
- Console report with recommendations

### 3. Bundle Analyzer (`bundle-analyzer.ts`)

**Purpose**: Detailed bundle size analysis and tree-shaking effectiveness.

**Usage**:
```bash
pnpm perf:bundle
```

**What it measures**:
- Individual service bundle sizes (raw and gzipped)
- Shared module breakdown per service
- Tree-shaking effectiveness analysis
- Most used exports from shared modules
- Bundle optimization opportunities

**Output**:
- `bundle-analysis-{timestamp}.json` - Detailed analysis
- Console report with optimization recommendations

### 4. Memory Tracker (`memory-tracker.ts`)

**Purpose**: Runtime memory usage monitoring and leak detection.

**Usage**:
```bash
pnpm perf:memory
```

**What it measures**:
- Heap usage patterns over time
- Memory growth rates and GC events
- Shared module memory impact estimation
- Validation decorator performance tracking
- Memory leak detection

**Output**:
- `memory-profile-{timestamp}.json` - Memory usage data
- Console report with memory optimization recommendations

### 5. Response Time Analyzer (`response-time-analyzer.ts`)

**Purpose**: Performance benchmarking of shared module operations.

**Usage**:
```bash
pnpm perf:response
```

**What it measures**:
- Validation decorator execution times
- Security utility performance (rate limiting, hashing, token generation)
- DTO serialization/deserialization performance
- Testing mock factory performance
- Throughput and percentile analysis

**Output**:
- `response-time-benchmark-{timestamp}.json` - Benchmark results
- Console report with performance recommendations

## Performance Metrics Explained

### Bundle Size Metrics

- **Raw Size**: Uncompressed bundle size
- **Gzipped Size**: Compressed size (closer to real-world transfer size)
- **Compression Ratio**: Raw size / Gzipped size (higher is better)
- **Tree-shaking Effectiveness**: Percentage of unused exports eliminated

### Memory Metrics

- **Heap Used**: Memory actively used by JavaScript objects
- **Heap Total**: Total heap memory allocated
- **RSS**: Resident Set Size (total memory used by process)
- **Memory Growth Rate**: Rate of memory increase over time (bytes/second)

### Response Time Metrics

- **Average**: Mean execution time
- **Median**: 50th percentile execution time
- **P95**: 95th percentile execution time (95% of operations complete faster)
- **P99**: 99th percentile execution time (99% of operations complete faster)
- **Throughput**: Operations per second

## Interpreting Results

### Performance Scores

- **90-100**: Excellent performance
- **70-89**: Good performance with minor optimization opportunities
- **50-69**: Moderate performance, optimization recommended
- **Below 50**: Poor performance, immediate optimization required

### Bundle Size Guidelines

- **< 1MB**: Excellent
- **1-2MB**: Good
- **2-5MB**: Moderate (optimization recommended)
- **> 5MB**: Poor (immediate optimization required)

### Response Time Guidelines

- **< 5ms**: Excellent
- **5-10ms**: Good
- **10-20ms**: Moderate
- **> 20ms**: Poor (optimization required)

### Memory Usage Guidelines

- **< 50MB**: Excellent
- **50-100MB**: Good
- **100-200MB**: Moderate
- **> 200MB**: High (investigation recommended)

## Common Optimization Strategies

### Bundle Size Optimization

1. **Tree-shaking**: Ensure only used exports are included
2. **Code splitting**: Split large bundles into smaller chunks
3. **Lazy loading**: Load modules only when needed
4. **Barrel export optimization**: Use selective exports instead of `export *`

### Memory Optimization

1. **Object pooling**: Reuse objects instead of creating new ones
2. **Weak references**: Use WeakMap/WeakSet for temporary associations
3. **Garbage collection**: Manually trigger GC in appropriate scenarios
4. **Memory leak detection**: Monitor for objects that aren't being cleaned up

### Response Time Optimization

1. **Caching**: Cache validation results and computed values
2. **Async processing**: Move heavy operations to background
3. **Batching**: Process multiple operations together
4. **Memoization**: Cache function results for repeated inputs

## Automation and CI/CD Integration

### Performance Regression Testing

Add to your CI/CD pipeline:

```yaml
- name: Performance Baseline Check
  run: |
    pnpm perf:baseline
    # Compare with previous baseline
    # Fail if performance degrades significantly
```

### Automated Monitoring

Set up regular performance monitoring:

```bash
# Daily performance check
0 2 * * * cd /path/to/project && pnpm perf:baseline

# Weekly detailed analysis
0 3 * * 0 cd /path/to/project && pnpm perf:bundle && pnpm perf:memory
```

## Troubleshooting

### Common Issues

1. **Build failures**: Ensure all services build successfully before running performance tests
2. **Memory errors**: Increase Node.js memory limit: `node --max-old-space-size=4096`
3. **Permission errors**: Ensure write permissions for `performance-reports` directory

### Performance Debugging

1. **High bundle sizes**: Use bundle analyzer to identify heavy dependencies
2. **Memory leaks**: Use memory tracker with longer monitoring periods
3. **Slow operations**: Use response time analyzer to identify bottlenecks

## Best Practices

1. **Regular monitoring**: Run baseline analysis weekly
2. **Before/after comparisons**: Always compare performance before and after changes
3. **Environment consistency**: Run tests in consistent environments
4. **Multiple runs**: Average results across multiple runs for accuracy
5. **Documentation**: Document performance changes and optimizations

## Contributing

When adding new shared modules or modifying existing ones:

1. Run performance baseline before changes
2. Implement changes
3. Run performance baseline after changes
4. Document any significant performance impacts
5. Include performance considerations in code reviews

## Support

For questions or issues with the performance monitoring system:

1. Check the troubleshooting section above
2. Review the generated reports for specific recommendations
3. Consult the shared module documentation for optimization guidelines
