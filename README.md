[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
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
<br>
miner_name: Miner

⚠ miner_name has to match the name given for the Nicehash Excavator Monitor integration.


Customization:
------
- gpu_max_temp
- gpu_warn_temp
- vram_max_temp
- vram_warn_temp
- fan_speed_warn
- mining_algorithm

![Config](https://github.com/MesserschmittX/lovelace-nicehash-excavator-monitor-card/blob/bdb1e7395937f5c307aeb4f9e99d5ee0f4a79d0e/images/card_config.png)
