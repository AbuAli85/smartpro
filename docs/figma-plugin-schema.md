# Figma Plugin JSON Schema Documentation

This document outlines the JSON schema used by the Figma plugin for rendering bilingual contracts.

## Overview

The Figma plugin receives a JSON structure from the `get-contract-layout` Edge Function and uses it to generate a visual representation of the contract in Figma. The JSON structure follows a specific schema that allows for bilingual content, images, and signature blocks.

## Top-Level Structure

\`\`\`json
{
  "id": "unique-identifier",
  "version": "1.0",
  "type": "contract",
  "metadata": {
    // Contract metadata (see below)
  },
  "figmaDocument": {
    // Figma document structure (see below)
  }
}
\`\`\`

## Metadata Structure

The metadata section contains information about the contract that can be used for filtering, searching, and displaying in the Figma plugin UI.

\`\`\`json
"metadata": {
  "title": "Promotion Agreement",
  "titleAr": "اتفاقية ترويج",
  "refNumber": "CONT-123456",
  "firstParty": {
    "name": "Company A",
    "nameAr": "الشركة أ",
    "address": "123 Main St",
    "addressAr": "١٢٣ الشارع الرئيسي"
  },
  "secondParty": {
    "name": "Company B",
    "nameAr": "الشركة ب",
    "address": "456 Side St",
    "addressAr": "٤٥٦ الشارع الجانبي"
  },
  "promoter": {
    "name": "John Doe",
    "nameAr": "جون دو"
  },
  "product": {
    "name": "Product X",
    "nameAr": "المنتج س"
  },
  "location": {
    "name": "Location Y",
    "nameAr": "الموقع ص"
  },
  "dates": {
    "start": "2023-01-01T00:00:00.000Z",
    "end": "2023-12-31T00:00:00.000Z",
    "durationDays": 365
  }
}
\`\`\`

## Figma Document Structure

The `figmaDocument` property contains a structure that follows Figma's node hierarchy. This is what the plugin uses to create the visual representation of the contract.

\`\`\`json
"figmaDocument": {
  "type": "DOCUMENT",
  "children": [
    {
      "type": "PAGE",
      "children": [
        {
          "type": "FRAME",
          "children": [
            // Figma elements (see below)
          ],
          "layoutMode": "VERTICAL",
          "primaryAxisAlignItems": "CENTER",
          "counterAxisAlignItems": "CENTER",
          "paddingLeft": 40,
          "paddingRight": 40,
          "paddingTop": 40,
          "paddingBottom": 40,
          "itemSpacing": 16,
          "width": 595,
          "height": 842
        }
      ]
    }
  ]
}
\`\`\`

## Figma Elements

The Figma document can contain various types of elements:

### Text Element

\`\`\`json
{
  "type": "TEXT",
  "characters": "Contract Title",
  "style": {
    "fontFamily": "Arial",
    "fontSize": 24,
    "fontWeight": 700,
    "textAlignHorizontal": "CENTER",
    "textAlignVertical": "CENTER",
    "fills": [
      {
        "type": "SOLID",
        "color": {
          "r": 0,
          "g": 0,
          "b": 0
        }
      }
    ]
  }
}
\`\`\`

### Bilingual Text Frame

\`\`\`json
{
  "type": "FRAME",
  "children": [
    {
      "type": "TEXT",
      "characters": "English Text",
      "style": {
        "fontFamily": "Arial",
        "fontSize": 14,
        "fontWeight": 400,
        "textAlignHorizontal": "LEFT",
        "textAlignVertical": "CENTER",
        "fills": [
          {
            "type": "SOLID",
            "color": {
              "r": 0,
              "g": 0,
              "b": 0
            }
          }
        ]
      }
    },
    {
      "type": "TEXT",
      "characters": "النص العربي",
      "style": {
        "fontFamily": "Arial",
        "fontSize": 14,
        "fontWeight": 400,
        "textAlignHorizontal": "RIGHT",
        "textAlignVertical": "CENTER",
        "fills": [
          {
            "type": "SOLID",
            "color": {
              "r": 0,
              "g": 0,
              "b": 0
            }
          }
        ]
      }
    }
  ],
  "layoutMode": "HORIZONTAL",
  "primaryAxisAlignItems": "SPACE_BETWEEN",
  "counterAxisAlignItems": "CENTER",
  "paddingLeft": 0,
  "paddingRight": 0,
  "paddingTop": 0,
  "paddingBottom": 0,
  "itemSpacing": 16,
  "width": 515,
  "height": 40
}
\`\`\`

### Image Element

\`\`\`json
{
  "type": "RECTANGLE",
  "fills": [
    {
      "type": "IMAGE",
      "scaleMode": "FILL",
      "imageHash": "imageHash", // This will be replaced by Figma
      "imageTransform": [
        [1, 0, 0],
        [0, 1, 0]
      ],
      "scalingFactor": 0.5,
      "rotation": 0
    }
  ],
  "cornerRadius": 4,
  "width": 200,
  "height": 200
}
\`\`\`

### Signature Block

\`\`\`json
{
  "type": "FRAME",
  "children": [
    {
      "type": "TEXT",
      "characters": "Party Name",
      "style": {
        "fontFamily": "Arial",
        "fontSize": 14,
        "fontWeight": 700,
        "textAlignHorizontal": "LEFT",
        "textAlignVertical": "CENTER",
        "fills": [
          {
            "type": "SOLID",
            "color": {
              "r": 0,
              "g": 0,
              "b": 0
            }
          }
        ]
      }
    },
    {
      "type": "TEXT",
      "characters": "Role",
      "style": {
        "fontFamily": "Arial",
        "fontSize": 12,
        "fontWeight": 400,
        "textAlignHorizontal": "LEFT",
        "textAlignVertical": "CENTER",
        "fills": [
          {
            "type": "SOLID",
            "color": {
              "r": 0.4,
              "g": 0.4,
              "b": 0.4
            }
          }
        ]
      }
    },
    {
      "type": "RECTANGLE",
      "fills": [
        {
          "type": "SOLID",
          "color": {
            "r": 0.95,
            "g": 0.95,
            "b": 0.95
          }
        }
      ],
      "cornerRadius": 4,
      "width": 200,
      "height": 80
    },
    {
      "type": "TEXT",
      "characters": "Signature",
      "style": {
        "fontFamily": "Arial",
        "fontSize": 10,
        "fontWeight": 400,
        "textAlignHorizontal": "CENTER",
        "textAlignVertical": "CENTER",
        "fills": [
          {
            "type": "SOLID",
            "color": {
              "r": 0.4,
              "g": 0.4,
              "b": 0.4
            }
          }
        ]
      }
    }
  ],
  "layoutMode": "VERTICAL",
  "primaryAxisAlignItems": "MIN",
  "counterAxisAlignItems": "MIN",
  "paddingLeft": 0,
  "paddingRight": 0,
  "paddingTop": 0,
  "paddingBottom": 0,
  "itemSpacing": 8,
  "width": 200,
  "height": 150
}
\`\`\`

## Best Practices

1. **Fixed Dimensions**: Use fixed dimensions (width and height) for frames to ensure consistent layout across different Figma files.
2. **Layout Modes**: Use `VERTICAL` for page layout and `HORIZONTAL` for bilingual text.
3. **Text Alignment**: Use `LEFT` for English text and `RIGHT` for Arabic text.
4. **Font Families**: Stick to common font families like Arial, Helvetica, or system fonts to ensure compatibility.
5. **Color Format**: Use RGB values between 0 and 1 (not 0-255).
6. **Image Handling**: For images, use rectangles with image fills rather than direct image elements.
7. **Spacing**: Use consistent spacing values (itemSpacing, padding) throughout the document.

## Example Usage

\`\`\`javascript
// In your Figma plugin code
async function createContractFromJSON(contractId) {
  // Fetch the contract JSON from your API
  const response = await fetch(`https://your-api.com/contracts/${contractId}`);
  const data = await response.json();
  
  // Access the Figma document structure
  const figmaDoc = data.figmaDocument;
  
  // Create a new page in the Figma document
  const page = figma.createPage();
  page.name = `Contract - ${data.metadata.title}`;
  
  // Process the document structure and create Figma nodes
  // This is a simplified example - you would need to recursively process the structure
  figmaDoc.children[0].children.forEach(frame => {
    const figmaFrame = figma.createFrame();
    figmaFrame.resize(frame.width, frame.height);
    figmaFrame.layoutMode = frame.layoutMode;
    // Set other properties...
    
    // Add the frame to the page
    page.appendChild(figmaFrame);
    
    // Process children of the frame
    // ...
  });
  
  // Select the new page
  figma.currentPage = page;
}
