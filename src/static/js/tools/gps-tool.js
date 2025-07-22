import { Logger } from '../utils/logger.js';

/**
 * Represents a tool for retrieving the user's current GPS location.
 */
export class GpsTool {
    /**
     * Returns the tool declaration for the Gemini API.
     * @returns {Object[]} An array containing the function declaration.
     */
    getDeclaration() {
        return [{
            name: "get_current_gps_location",
            description: "Get the user's current GPS coordinates (latitude and longitude) from the browser.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }];
    }

    /**
     * Executes the tool to get the current GPS location.
     * This will trigger a browser permission prompt for the user.
     * @returns {Promise<Object>} A promise that resolves with the GPS coordinates.
     * @throws {Error} Throws an error if the user denies permission or an error occurs.
     */
    async execute() {
        Logger.info('Executing GPS Tool: Requesting user location...');
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                const errorMsg = "Geolocation is not supported by this browser.";
                Logger.error(errorMsg);
                reject(new Error(errorMsg));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    Logger.info('GPS Tool: Location acquired', coords);
                    // Gemini prefers a string format for coordinates in subsequent API calls
                    resolve({
                        status: "OK",
                        message: "Successfully retrieved GPS location.",
                        coordinates: `${coords.latitude},${coords.longitude}`
                    });
                },
                (error) => {
                    let errorMsg = "GPS Tool failed: ";
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg += "User denied the request for Geolocation.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg += "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMsg += "The request to get user location timed out.";
                            break;
                        case error.UNKNOWN_ERROR:
                            errorMsg += "An unknown error occurred.";
                            break;
                    }
                    Logger.error(errorMsg, error);
                    reject(new Error(errorMsg));
                }
            );
        });
    }
}
