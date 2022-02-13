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
                </ha-card>
            `;
            this.content = this.querySelector("div");
        }

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

            const gpu = gpu_sensor?.state === "Unavailable" ? "Unavailable" : gpu_sensor.state + gpu_sensor.attributes.unit_of_measurement;
            const vram = vram_sensor?.state === "Unavailable" ? "Unavailable" : vram_sensor.state + vram_sensor.attributes.unit_of_measurement;
            const fan = fan_sensor?.state === "Unavailable" ? "Unavailable" : fan_sensor.state + fan_sensor.attributes.unit_of_measurement;
            const power = power_sensor?.state === "Unavailable" ? "Unavailable" : power_sensor.state + power_sensor.attributes.unit_of_measurement;
            const hashrate = !hash_sensor?.state || hash_sensor?.state === "Unavailable" ? "Unavailable" : hash_sensor.state + hash_sensor.attributes.unit_of_measurement;
            this.rows.push(
                `<tr>
                    <td style="padding:5px;">${i}</td>
                    <td style="padding:5px;">${gpu_model}</td>
                    <td style="padding:5px;">${gpu_vendor}</td>
                    <td style="padding:5px; color:${gpu_color};">${gpu}</td>
                    <td style="padding:5px; color:${vram_color};">${vram}</td>
                    <td style="padding:5px; color:${fan_color};">${fan}</td>
                    <td style="padding:5px;">${power}</td>
                    <td style="padding:5px;">${hashrate}</td>
                </tr>`
            );
        }
        const table_top = `<table>
            <tr>
                <th scope="col" style="padding:5px;">ID</th>
                <th scope="col" style="padding:5px;">Model</th>
                <th scope="col" style="padding:5px;">Vendor</th>
                <th scope="col" style="padding:5px;">GPU</th>
                <th scope="col" style="padding:5px;">VRAM</th>
                <th scope="col" style="padding:5px;">Fans</th>
                <th scope="col" style="padding:5px;">Power</th>
                <th scope="col" style="padding:5px;">Hashrate</th>
            </tr>`;
        let table_body = "";
        for (let item of this.rows) {
            table_body = table_body + item;
        }
        const table_end = `</table>`;

        this.content.innerHTML = table_top + table_body + table_end;
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
