const express = require('express');
const { exec } = require('child_process'); // Use exec to run CLI commands
const cors = require('cors');
require('dotenv').config();  // Load environment variables

const app = express();
app.use(cors());

app.get('/speedtest', (req, res) => {
    // Use environment variable for the speedtest CLI command
    const speedtestCommand = process.env.SPEEDTEST_COMMAND || 'speedtest --format=json';
    
    // Execute the speedtest CLI command
    exec(speedtestCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing speedtest: ${error.message}`);
            return res.status(500).json({ error: 'Speed test failed to execute' });
        }

        if (stderr) {
            console.error(`Speedtest error output: ${stderr}`);
            return res.status(500).json({ error: 'Error from speedtest CLI' });
        }

        // Log the raw output for debugging
        console.log('Raw speedtest output:', stdout);

        if (!stdout || stdout.trim() === '') {
            console.error('Speedtest returned no output.');
            return res.status(500).json({ error: 'Speedtest returned no output' });
        }

        try {
            // Parse the JSON output from speedtest CLI
            const result = JSON.parse(stdout);

            // Respond with download, upload, and latency details
            res.json({
                download: (result.download.bandwidth / 125000).toFixed(2),  // Convert to Mbps
                upload: (result.upload.bandwidth / 125000).toFixed(2),  // Convert to Mbps
                latency: result.ping.latency,  // Latency in ms
                jitter: result.ping.jitter,    // Jitter in ms
                packetLoss: result.packetLoss  // Packet loss in percentage
            });
        } catch (err) {
            console.error(`Error parsing speedtest result: ${err}`);
            res.status(500).json({ error: 'Failed to parse speedtest result' });
        }
    });
});

app.listen(3000, () => {
    console.log('Speed Test Server running on port 3000');
});
