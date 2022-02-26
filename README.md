
[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)
![HACS Action](https://github.com/MesserschmittX/hacs-nicehash-excavator/actions/workflows/hacs.yml/badge.svg?style=for-the-badge)


# Nicehash Excavator Monitor Card
Home Assistant UI Card to better display sensors of the [Nicehash Excavator Monitor](https://github.com/MesserschmittX/ha-nicehash-excavator-monitor) integration.


Requirements:
------
- [Nicehash Excavator Monitor](https://github.com/MesserschmittX/ha-nicehash-excavator-monitor) integration


Example:
------
![Demo](https://github.com/MesserschmittX/lovelace-nicehash-excavator-monitor-card/blob/bdb1e7395937f5c307aeb4f9e99d5ee0f4a79d0e/images/card_demo.png)


Usage:
------
type: custom:nicehash-excavator-monitor-card

miner_name: Miner

⚠ miner_name has to match the name given for the Nicehash Excavator Monitor integration.


Customization:
------
- gpu_warn_temp (default: 70)
- gpu_max_temp (default: 80)
- vram_warn_temp (default: 90)
- vram_max_temp (default: 95)
- fan_speed_warn (default: 98)
- mining_algorithm (default: daggerhashimoto)
- total_power_warn: (no default)
- total_min_hashrate_warn: (no default)

![Config](https://github.com/MesserschmittX/lovelace-nicehash-excavator-monitor-card/blob/02102895984b79f248cf21d85cb5419e64480dbf/images/card_config.png)

disable sensors with false
- gpu_id: (default: true)
- gpu_model: (default: true)
- gpu_vendor: (default: true)
- gpu_temp: (default: true)
- vram_temp: (default: true)
- fan_speed: (default: true)
- gpu_power: (default: true)
- gpu_hashrate: (default: true)
- combined_stats: (default: true)
- cpu: (default: true)
- ram: (default: true)
- power: (default: true)
- hashrate: (default: true)
