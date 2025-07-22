#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

const BAIDU_MAPS_API_KEY = process.env.BAIDU_MAPS_API_KEY || 'K0RhNE8R4HEF00DNhat61mmqaIlROWAL';

class BaiduMapsServer {
  constructor() {
    this.server = new Server(
      {
        name: 'baidu-maps-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_location_info',
          description: 'Get location information for a specific query from Baidu Maps',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query for the location (e.g., "北京大学")'
              },
              region: {
                type: 'string',
                description: 'The city or region to search within (e.g., "北京")'
              }
            },
            required: ['query', 'region']
          }
        },
        {
          name: 'get_driving_directions',
          description: 'Get driving directions between two locations from Baidu Maps',
          inputSchema: {
            type: 'object',
            properties: {
              origin: {
                type: 'string',
                description: 'The starting point for the directions (e.g., "北京西站" or "40.011116,116.339303")'
              },
              destination: {
                type: 'string',
                description: 'The ending point for the directions (e.g., "故宫" or "39.936404,116.452562")'
              }
            },
            required: ['origin', 'destination']
          }
        },
        {
          name: 'search_nearby_places',
          description: 'Search for nearby places around a location using Baidu Maps',
          inputSchema: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The center location (e.g., "39.915,116.404")'
              },
              keyword: {
                type: 'string',
                description: 'The keyword to search for (e.g., "餐厅", "银行")'
              },
              radius: {
                type: 'number',
                description: 'Search radius in meters (default: 1000)',
                default: 1000
              }
            },
            required: ['location', 'keyword']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_location_info': {
            const { query, region } = args;
            const url = `https://api.map.baidu.com/place/v2/search?query=${encodeURIComponent(query)}&region=${encodeURIComponent(region)}&output=json&ak=${BAIDU_MAPS_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status !== 0) {
              throw new Error(`Baidu Maps API error: ${data.message || 'Unknown error'}`);
            }
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Found ${data.results?.length || 0} results for "${query}" in ${region}:\n\n${data.results?.map((result, index) => 
                    `${index + 1}. ${result.name}\n   Address: ${result.address}\n   Location: ${result.location?.lat}, ${result.location?.lng}\n   Phone: ${result.telephone || 'N/A'}`
                  ).join('\n\n') || 'No results found'}`
                }
              ]
            };
          }

          case 'get_driving_directions': {
            const { origin, destination } = args;
            const url = `https://api.map.baidu.com/direction/v2/driving?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&ak=${BAIDU_MAPS_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status !== 0) {
              throw new Error(`Baidu Maps API error: ${data.message || 'Unknown error'}`);
            }
            
            const route = data.result?.routes?.[0];
            if (!route) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `No driving directions found from ${origin} to ${destination}.`
                  }
                ]
              };
            }
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Driving directions from ${origin} to ${destination}:\n\nDistance: ${route.distance}m (${Math.round(route.distance/1000)}km)\nDuration: ${Math.round(route.duration/60)} minutes\n\nSteps:\n${route.steps?.map((step, index) => 
                    `${index + 1}. ${step.instruction} (${step.distance}m)`
                  ).join('\n') || 'No detailed steps available'}`
                }
              ]
            };
          }

          case 'search_nearby_places': {
            const { location, keyword, radius = 1000 } = args;
            const url = `https://api.map.baidu.com/place/v2/search?query=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&radius=${radius}&output=json&ak=${BAIDU_MAPS_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status !== 0) {
              throw new Error(`Baidu Maps API error: ${data.message || 'Unknown error'}`);
            }
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Found ${data.results?.length || 0} ${keyword} places near ${location}:\n\n${data.results?.map((result, index) => 
                    `${index + 1}. ${result.name}\n   Address: ${result.address}\n   Distance: ${result.detail_info?.distance || 'N/A'}m\n   Phone: ${result.telephone || 'N/A'}`
                  ).join('\n\n') || 'No results found'}`
                }
              ]
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Baidu Maps MCP server running on stdio');
  }
}

const server = new BaiduMapsServer();
server.run().catch(console.error);
