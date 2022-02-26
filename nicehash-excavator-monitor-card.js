class NicehashExcavatorMonitorCard extends HTMLElement {
    rows = [];
    config;
    content;
    display_name = "";
    miner_name = "";

    set hass(hass) {
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
            const gpu_count = states["sensor." + this.miner_name + "_gpu_count"]?.state;

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
            for (let i = 0; i < gpu_count; i++) {
                const gpu_sensor = states["sensor." + this.miner_name + "_gpu_" + i + "_gpu"];
                const vram_sensor = states["sensor." + this.miner_name + "_gpu_" + i + "_vram"];
                const fan_sensor = states["sensor." + this.miner_name + "_gpu_" + i + "_fan"];
                const power_sensor = states["sensor." + this.miner_name + "_gpu_" + i + "_power"];
                const hash_sensor = states["sensor." + this.miner_name + "_gpu_" + i + "_" + mining_algorithm];
                const gpu_model = states["sensor." + this.miner_name + "_gpu_" + i + "_gpu_model"].state?.replace("GeForce ", "").replace("RTX ", "");
                const gpu_vendor_id = states["sensor." + this.miner_name + "_gpu_" + i + "_vendor_id"].state?.toUpperCase();
                const gpu_vendor = PCIE_VENDOR_IDS[gpu_vendor_id] ?? gpu_vendor_id;

                const gpu_color = gpu_sensor?.state >= gpu_max_temp ? "red" : gpu_sensor?.state < gpu_warn_temp ? "green" : "yellow";
                const vram_color = vram_sensor?.state >= vram_max_temp ? "red" : vram_sensor?.state < vram_warn_temp ? "green" : "yellow";
                const fan_color = fan_sensor?.state >= fan_speed_warn ? "yellow" : "white";

                const gpu = !gpu_sensor?.state ? "Unavailable" : gpu_sensor.state + gpu_sensor.attributes.unit_of_measurement;
                const vram = !vram_sensor?.state ? "Unavailable" : vram_sensor.state + vram_sensor.attributes.unit_of_measurement;
                const fan = !fan_sensor?.state ? "Unavailable" : fan_sensor.state + fan_sensor.attributes.unit_of_measurement;
                const power = !power_sensor?.state ? "Unavailable" : power_sensor.state + power_sensor.attributes.unit_of_measurement;
                const hashrate = !hash_sensor?.state || hash_sensor?.state === "Unavailable" ? "Unavailable" : hash_sensor.state + hash_sensor.attributes.unit_of_measurement;

                let row = `<tr>`;
                if (this.config.gpu_id !== false) row += `<td class="table_element tooltip">${i}<span class="tooltiptext">Tooltip text</span></td>`;
                if (this.config.gpu_model !== false) row += `<td class="table_element tooltip">${gpu_model}</td>`;
                if (this.config.gpu_vendor !== false) row += `<td class="table_element tooltip">${gpu_vendor}`;
                if (this.config.gpu_temp !== false)
                    row += `<td class="table_element tooltip" style="color:${gpu_color};">${gpu}<span class="tooltiptext">updated: ${new Date(gpu_sensor.last_updated).toLocaleString()}</span></td>`;
                if (this.config.vram_temp !== false)
                    row += `<td class="table_element tooltip" style="color:${vram_color};">${vram}<span class="tooltiptext">updated: ${new Date(
                        vram_sensor.last_updated
                    ).toLocaleString()}</span></td>`;
                if (this.config.fan_speed !== false)
                    row += `<td class="table_element tooltip" style="color:${fan_color};">${fan}<span class="tooltiptext">updated: ${new Date(fan_sensor.last_updated).toLocaleString()}</span></td>`;
                if (this.config.gpu_power !== false)
                    row += `<td class="table_element tooltip">${power}<span class="tooltiptext">updated: ${new Date(power_sensor.last_updated).toLocaleString()}</span></td>`;
                if (this.config.gpu_hashrate !== false)
                    row += `<td class="table_element tooltip">${hashrate}<span class="tooltiptext">updated: ${new Date(hash_sensor.last_updated).toLocaleString()}</span></td>`;
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
                const miner_power_sensor = states["sensor." + this.miner_name + "_power"];
                const miner_hash_sensor = states["sensor." + this.miner_name + "_" + mining_algorithm];
                const miner_cpu_sensor = states["sensor." + this.miner_name + "_cpu"];
                const miner_ram_sensor = states["sensor." + this.miner_name + "_ram"];

                const miner_power = !miner_power_sensor?.state ? "Unavailable" : miner_power_sensor.state + miner_power_sensor.attributes.unit_of_measurement;
                const miner_hashrate =
                    !miner_hash_sensor?.state || miner_hash_sensor?.state === "Unavailable" ? "Unavailable" : miner_hash_sensor.state + miner_hash_sensor.attributes.unit_of_measurement;
                const miner_cpu = !miner_cpu_sensor?.state ? "Unavailable" : miner_cpu_sensor.state + miner_cpu_sensor.attributes.unit_of_measurement;
                const miner_ram = !miner_ram_sensor?.state ? "Unavailable" : miner_ram_sensor.state + miner_ram_sensor.attributes.unit_of_measurement;

                const total_power_color = miner_power_sensor?.state >= total_power_warn ? "yellow" : "white";
                const total_hashrate_color = miner_hash_sensor?.state < total_min_hashrate_warn ? "yellow" : "white";

                combined_table += `<table class="miner_table"><tr>`;
                if (this.config.cpu !== false) combined_table += `<th scope="col" class="table_element">CPU</th>`;
                if (this.config.ram !== false) combined_table += `<th scope="col" class="table_element">RAM</th>`;
                if (this.config.power !== false) combined_table += `<th scope="col" class="table_element">Power</th>`;
                if (this.config.hashrate !== false) combined_table += `<th scope="col" class="table_element">Hashrate</th>`;
                combined_table += `</tr><tr>`;
                if (this.config.cpu !== false)
                    combined_table += `<td class="table_element tooltip">${miner_cpu}<span class="tooltiptext">updated: ${new Date(miner_cpu_sensor.last_updated).toLocaleString()}</span></td>`;
                if (this.config.ram !== false)
                    combined_table += `<td class="table_element tooltip">${miner_ram}<span class="tooltiptext">updated: ${new Date(miner_ram_sensor.last_updated).toLocaleString()}</span></td>`;
                if (this.config.power !== false)
                    combined_table += `<td class="table_element tooltip" style="color:${total_power_color};">${miner_power}<span class="tooltiptext">updated: ${new Date(
                        miner_power_sensor.last_updated
                    ).toLocaleString()}</span></td>`;
                if (this.config.hashrate !== false)
                    combined_table += `<td class="table_element tooltip" style="color:${total_hashrate_color};">${miner_hashrate}<span class="tooltiptext">updated: ${new Date(
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

    getCardSize() {
        return this.rows.length / 2 + 2;
    }
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

.tooltip .tooltiptext {
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

.tooltip .tooltiptext::after {
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

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}`;
