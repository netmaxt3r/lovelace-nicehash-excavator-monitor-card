
[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)
![HACS Action](https://github.com/MesserschmittX/hacs-nicehash-excavator/actions/workflows/hacs.yml/badge.svg?style=for-the-badge)


# Nicehash Excavator Monitor Card
Home Assistant UI Card to better display sensors of the [Nicehash Excavator Monitor](https://github.com/MesserschmittX/ha-nicehash-excavator-monitor) integration.


Requirements
------
- [Nicehash Excavator Monitor](https://github.com/MesserschmittX/ha-nicehash-excavator-monitor) integration


Example
------
![Demo](https://github.com/MesserschmittX/lovelace-nicehash-excavator-monitor-card/blob/bdb1e7395937f5c307aeb4f9e99d5ee0f4a79d0e/images/card_demo.png)


Usage
------
type: custom:nicehash-excavator-monitor-card

miner_name: Miner

⚠ miner_name has to match the name given for the Nicehash Excavator Monitor integration.


Customization
------

Key | Description | Default
------------ | ------------- | -------------
`gpu_warn_temp` | GPU temp will be colored yellow above this temperature | `70`
`gpu_max_temp` | GPU temp will be colored red above this temperature | `80`
`vram_warn_temp` | VRAM temp will be colored yellow above this temperature | `90`
`vram_max_temp` | VRAM temp will be colored red above this temperature | `95`
`fan_speed_warn` | Fan speed will be colored yellow above this percentage | `98`
`mining_algorithm` | Mining algorithm that is shown | `daggerhashimoto`
`total_power_warn` | Mining rig power will be colored yellow below this value | `None`
`total_min_hashrate_warn` | Mining rig hashrate be colored yellow below this value | `None`
`gpu_id` | Show GPU ID | `true`
`gpu_model` | Show GPU model | `true`
`gpu_vendor` | Show GPU vendor | `true`
`gpu_temp` | Show GPU temp | `true`
`vram_temp` | Show VRAM temp | `true`
`fan_speed` | Show fan speed | `true`
`gpu_power` | Show GPU power | `true`
`gpu_hashrate` | Show GPU hashrate | `true`
`combined_stats` | Show combined stats in top bar | `true`
`cpu` | Show mining rig CPU usage | `true`
`ram` | Show mining rig RAM usage | `true`
`power` | Show combined power usage | `true`
`hashrate` | Show combined hashrate | `true`

![Config](https://github.com/MesserschmittX/lovelace-nicehash-excavator-monitor-card/blob/02102895984b79f248cf21d85cb5419e64480dbf/images/card_config.png)
