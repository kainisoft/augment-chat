# Loki Retention Configuration Guide

## Overview

This document provides detailed configuration examples for setting up Grafana Loki with a 3-month (90 days) log retention policy. This configuration ensures that logs older than 3 months are automatically removed from the system, helping to manage storage costs and system performance.

## Table of Contents

- [Overview](#overview)
- [Retention Configuration](#retention-configuration)
  - [Using the Compactor](#using-the-compactor)
  - [Configuration File Example](#configuration-file-example)
- [Verifying Retention](#verifying-retention)
- [Environment-Specific Configurations](#environment-specific-configurations)
- [Troubleshooting](#troubleshooting)
- [Related Documents](#related-documents)

## Retention Configuration

### Using the Compactor

Loki uses the Compactor component to handle log retention. The Compactor is responsible for:

1. Compacting small chunks into larger ones to improve query performance
2. Enforcing retention policies by removing old data
3. Managing the lifecycle of log data

For retention to work properly, the Compactor must be:
- Enabled with `retention_enabled: true`
- Configured with appropriate working directories
- Set to run at regular intervals via `compaction_interval`

### Configuration File Example

Below is a complete example of a Loki configuration file with 3-month retention enabled:

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
    cache_ttl: 24h
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

# Retention configuration using the Compactor
compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
  retention_delete_worker_count: 150

# Global retention period (3 months)
limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
  retention_period: 2160h  # 90 days (3 months)

chunk_store_config:
  max_look_back_period: 0s
```

## Verifying Retention

To verify that the retention policy is working correctly:

1. Check the Compactor logs for messages about retention deletion:
   ```
   level=info msg="retention deletion in progress" table=<table_name>
   ```

2. Monitor storage usage over time to ensure it stabilizes after the retention period.

3. Query for old logs that should have been deleted to confirm they are no longer available.

## Environment-Specific Configurations

### Development Environment

For development, a shorter retention period is typically used:

```yaml
limits_config:
  retention_period: 168h  # 7 days
```

### Production Environment

For production, the full 3-month retention is used:

```yaml
limits_config:
  retention_period: 2160h  # 90 days (3 months)
```

### Stream-Specific Retention

You can also configure different retention periods for different log streams based on labels:

```yaml
limits_config:
  retention_period: 2160h  # Default 3-month retention
  
  retention_stream_selectors:
    - '{namespace="critical"}'
    - '{level="debug"}'
  retention_stream_periods:
    - 4320h  # 180 days (6 months) for critical logs
    - 720h   # 30 days (1 month) for debug logs
```

## Troubleshooting

Common issues with retention:

1. **Retention not working**: Ensure the Compactor is running and `retention_enabled` is set to `true`.

2. **Slow deletion process**: Adjust `retention_delete_worker_count` to increase parallelism.

3. **High disk usage during deletion**: Set an appropriate `retention_delete_delay` to control the deletion rate.

4. **Logs not being deleted**: Check that the `retention_period` is correctly set in hours.

## Related Documents

- [Logging Architecture](LOGGING_ARCHITECTURE.md)
- [Logging Technical Design](LOGGING_TECHNICAL_DESIGN.md)
- [Logging Implementation Plan](LOGGING_IMPLEMENTATION_PLAN.md)
- [Official Loki Documentation](https://grafana.com/docs/loki/latest/operations/storage/retention/)

## Document Information
- **Author**: Chat Application Team
- **Created**: 2023-07-15
- **Last Updated**: 2023-07-15
- **Version**: 1.0.0
