class NicehashExcavatorMonitorCard extends HTMLElement {
    rows = [];
    config;
    content;
    display_name = "";
    miner_name = "";

    set hass(hass) {
        const text_color = hass.themes.darkMode ? "white" : "black";
        const ok_color = hass.themes.darkMode ? "green" : "green";
        const warn_color = hass.themes.darkMode ? "yellow" : "#ffc800";
        const error_color = hass.themes.darkMode ? "red" : "red";

        const states = hass.states;

        this.display_name = this.config.miner_name;
        this.miner_name = this.config.miner_name.replace(" ", "_").toLowerCase();

        if (!this.content) {
            this.innerHTML = `
                <ha-card header="${this.display_name}">
                    <div class="card-content"></div>
                    <style>
                        ${styles}
                    </style>
                </ha-card>
            `;
            this.content = this.querySelector("div");
        }

        try {
            const count_id = "sensor." + this.miner_name + "_gpu_count";
            const gpu_count = states[count_id]?.state;

            if (!(gpu_count >= 0)) {
                this.content.innerHTML = "<p> No GPUs found for this miner name </p>";
                return;
            }

            let mining_algorithm = this.config.algorithm ?? "daggerhashimoto";
            let gpu_warn_temp = this.config.gpu_warn_temp ?? 70;
            let gpu_max_temp = this.config.gpu_max_temp ?? 80;
            let vram_warn_temp = this.config.vram_warn_temp ?? 90;
            let vram_max_temp = this.config.vram_max_temp ?? 95;
            let fan_speed_warn = this.config.fan_speed_warn ?? 98;
            let total_power_warn = this.config.total_power_warn;
            let total_min_hashrate_warn = this.config.total_min_hashrate_warn;

            this.rows = [];
            const miner_id = hass.entities[count_id].device_id
            const miner = hass.devices[miner_id];
            const gpus = Object.values(hass.devices).filter(d => d.via_device_id == miner_id)

            for (const gpu_device of gpus) {
                const entities = Object.values(hass.entities).filter(e => e.device_id == gpu_device.id && e.platform == "nicehash_excavator")
                const gpu_sensor = states[getEntityByPrefix(entities,"gpu")];
                const vram_sensor = states[getEntityByPrefix(entities,"vram")];
                const fan_sensor = states[getEntityByPrefix(entities,"fan")];
                const power_sensor = states[getEntityByPrefix(entities,"power")];
                const hash_sensor = states[getEntityByPrefix(entities,mining_algorithm)];
                const gpu_model_sensor = states[getEntityByPrefix(entities,"gpu_model")].state?.replace("GeForce ", "").replace("RTX ", "");
                const gpu_vendor_id = states[getEntityByPrefix(entities,"vendor_id")].state?.toUpperCase();
                const gpu_vendor_sensor = PCIE_VENDOR_IDS[gpu_vendor_id] ?? gpu_vendor_id;

                const gpu_model = gpu_model_sensor.toLowerCase() === "unavailable" ? "NaN" : gpu_model_sensor;
                const gpu_vendor = gpu_vendor_sensor.toLowerCase() === "unavailable" ? "NaN" : gpu_vendor_sensor;

                const gpu_color = gpu_sensor?.state >= gpu_max_temp ? error_color : gpu_sensor?.state < gpu_warn_temp ? ok_color : warn_color;
                const vram_color = vram_sensor?.state >= vram_max_temp ? error_color : vram_sensor?.state < vram_warn_temp ? ok_color : warn_color;
                const fan_color = fan_sensor?.state >= fan_speed_warn ? warn_color : text_color;

                const gpu = gpu_sensor?.state.toLowerCase() === "unavailable" ? "NaN" : gpu_sensor.state + gpu_sensor.attributes.unit_of_measurement;
                const vram = vram_sensor?.state.toLowerCase() === "unavailable" ? "NaN" : vram_sensor.state + vram_sensor.attributes.unit_of_measurement;
                const fan = fan_sensor?.state.toLowerCase() === "unavailable" ? "NaN" : fan_sensor.state + fan_sensor.attributes.unit_of_measurement;
                const power = power_sensor?.state.toLowerCase() === "unavailable" ? "NaN" : power_sensor.state + power_sensor.attributes.unit_of_measurement;
                const hashrate = hash_sensor ? (
                    hash_sensor?.state.toLowerCase() === "unavailable" ? "NaN" : hash_sensor.state + hash_sensor.attributes.unit_of_measurement) :
                    "-";

                let row = `<tr>`;
                if (this.config.gpu_id !== false) row += `<td class="table_element tooltip">${ gpu_device.name_by_user ?? gpu_device.name}</td>`;
                if (this.config.gpu_model !== false) row += `<td class="table_element tooltip">${gpu_model}</td>`;
                if (this.config.gpu_vendor !== false) row += `<td class="table_element tooltip">${gpu_vendor}`;
                if (this.config.gpu_temp !== false)
                    row += `<td class="table_element tooltip" style="color:${gpu_color};">${gpu}<span class="tooltip-text">updated: ${new Date(gpu_sensor.last_updated).toLocaleString()}</span></td>`;
                if (this.config.vram_temp !== false)
                    row += `<td class="table_element tooltip" style="color:${vram_color};">${vram}<span class="tooltip-text">updated: ${new Date(
                        vram_sensor.last_updated
                    ).toLocaleString()}</span></td>`;
                if (this.config.fan_speed !== false)
                    row += `<td class="table_element tooltip" style="color:${fan_color};">${fan}<span class="tooltip-text">updated: ${new Date(fan_sensor.last_updated).toLocaleString()}</span></td>`;
                if (this.config.gpu_power !== false)
                    row += `<td class="table_element tooltip">${power}<span class="tooltip-text">updated: ${new Date(power_sensor.last_updated).toLocaleString()}</span></td>`;
                if (this.config.gpu_hashrate !== false && hash_sensor)
                    row += `<td class="table_element tooltip">${hashrate}<span class="tooltip-text">updated: ${hash_sensor ? new Date(hash_sensor.last_updated).toLocaleString() : ''}</span></td>`;
                row += `</tr>`;

                this.rows.push(row);
            }
            let table_top = `<table class="gpu_table"><tr>`;
            if (this.config.gpu_id !== false) table_top += `<th scope="col" class="table_element">ID</th>`;
            if (this.config.gpu_model !== false) table_top += `<th scope="col" class="table_element">Model</th>`;
            if (this.config.gpu_vendor !== false) table_top += `<th scope="col" class="table_element">Vendor</th>`;
            if (this.config.gpu_temp !== false) table_top += `<th scope="col" class="table_element">GPU</th>`;
            if (this.config.vram_temp !== false) table_top += `<th scope="col" class="table_element">VRAM</th>`;
            if (this.config.fan_speed !== false) table_top += `<th scope="col" class="table_element">Fans</th>`;
            if (this.config.gpu_power !== false) table_top += `<th scope="col" class="table_element">Power</th>`;
            if (this.config.gpu_hashrate !== false) table_top += `<th scope="col" class="table_element">Hashrate</th>`;
            table_top += `</tr>`;
            let table_body = "";
            for (let item of this.rows) {
                table_body = table_body + item;
            }
            const table_end = `</table>`;

            let combined_table = "";
            if (this.config.combined_stats !== false) {
                const entities = Object.values(hass.entities).filter(e => e.device_id == miner_id && e.platform == "nicehash_excavator")

                const miner_power_sensor = states[getEntityByPrefix(entities,"power")];
                const miner_hash_sensor = states[getEntityByPrefix(entities, mining_algorithm)];
                const miner_cpu_sensor = states[getEntityByPrefix(entities,"cpu")];
                const miner_ram_sensor = states[getEntityByPrefix(entities,"ram")];

                const miner_power = miner_power_sensor?.state === "unavailable" ? "NaN" : miner_power_sensor.state + miner_power_sensor.attributes.unit_of_measurement;
                const miner_hashrate = miner_hash_sensor ?
                    (miner_hash_sensor?.state === "unavailable" ? "NaN" : miner_hash_sensor.state + miner_hash_sensor.attributes.unit_of_measurement) :
                    "-";
                const miner_cpu = miner_cpu_sensor?.state === "unavailable" ? "NaN" : miner_cpu_sensor.state + miner_cpu_sensor.attributes.unit_of_measurement;
                const miner_ram = miner_ram_sensor?.state === "unavailable" ? "NaN" : miner_ram_sensor.state + miner_ram_sensor.attributes.unit_of_measurement;

                const total_power_color = miner_power_sensor?.state >= total_power_warn ? warn_color : text_color;
                const total_hashrate_color = miner_hash_sensor?.state < total_min_hashrate_warn ? warn_color : text_color;

                combined_table += `<table class="miner_table"><tr>`;
                if (this.config.cpu !== false) combined_table += `<th scope="col" class="table_element">CPU</th>`;
                if (this.config.ram !== false) combined_table += `<th scope="col" class="table_element">RAM</th>`;
                if (this.config.power !== false) combined_table += `<th scope="col" class="table_element">Power</th>`;
                if (this.config.hashrate !== false) combined_table += `<th scope="col" class="table_element">Hashrate</th>`;
                combined_table += `</tr><tr>`;
                if (this.config.cpu !== false)
                    combined_table += `<td class="table_element tooltip">${miner_cpu}<span class="tooltip-text">updated: ${new Date(miner_cpu_sensor.last_updated).toLocaleString()}</span></td>`;
                if (this.config.ram !== false)
                    combined_table += `<td class="table_element tooltip">${miner_ram}<span class="tooltip-text">updated: ${new Date(miner_ram_sensor.last_updated).toLocaleString()}</span></td>`;
                if (this.config.power !== false)
                    combined_table += `<td class="table_element tooltip" style="color:${total_power_color};">${miner_power}<span class="tooltip-text">updated: ${new Date(
                        miner_power_sensor.last_updated
                    ).toLocaleString()}</span></td>`;
                if (this.config.hashrate !== false && miner_hash_sensor)
                    combined_table += `<td class="table_element tooltip" style="color:${total_hashrate_color};">${miner_hashrate}<span class="tooltip-text">updated: ${new Date(
                        miner_hash_sensor.last_updated
                    ).toLocaleString()}</span></td>`;
                combined_table += `</tr></table>`;
            }

            this.content.innerHTML = combined_table + table_top + table_body + table_end;
        } catch (error) {
            this.content.innerHTML = "<p> An error occurred, please check if you are using the correct version of the Nicehash Excavator Monitor integration </p>";
        }
    }

    setConfig(config) {
        if (!config.miner_name) {
            throw new Error("You need to define the miner name");
        }
        this.config = config;
    }

   //getCardSize() {
   //     return this.rows.length / 2 + 2;
   // }

}
function getEntityByPrefix(entities, prefix) {
    return entities.find(e => e.entity_id.endsWith(prefix))?.entity_id
}
customElements.define("nicehash-excavator-monitor-card", NicehashExcavatorMonitorCard);

const PCIE_VENDOR_IDS = {
    1462: "MSI",
    1043: "ASUS",
    "807D": "ASUS",
    "19DA": "ZOTAC",
    1569: "Palit",
    "12D2": "NVIDIA",
    "10DE": "NVIDIA",
    3842: "EVGA",
    1458: "Gigabyte",

    "10B0": "Gainward?",
    2204: "NVIDIA?",
    2206: "NVIDIA?",
};

const styles = `

table {
  text-align-last: right;
}

.gpu_table {
  width: 100%;
}

.miner_table {
  float: right;
}

.table_element {
  padding:5px;
}

.tooltip {
  position: relative;
  width: max-content;
}

.tooltip .tooltip-text {
  text-align-last: center;
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;

  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip .tooltip-text::after {
  text-align-last: center;
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}`;
