import asyncio
import aiohttp
import os
from bson import ObjectId

# Configuration
BASE_URL = "http://127.0.0.1:8002/api/v1/products"  # Adjusted port as provided
HEADERS = {"Content-Type": "application/json"}

# Category and product hierarchy
CATEGORY_DATA = [
    {
        "name": "Apple",
        "subcategories": [
            {"name": "iPhones", "subcategories": [
                {"name": "iPhone 14"},
                {"name": "iPhone 13"},
                {"name": "iPhone SE"},
                {"name": "iPhone 12"},
                {"name": "iPhone 11"}
            ]},
            {"name": "iPads", "subcategories": [
                {"name": "iPad Pro"},
                {"name": "iPad Air"},
                {"name": "iPad Mini"},
                {"name": "iPad (10th Gen)"},
                {"name": "iPad 9th Gen"}
            ]},
            {"name": "MacBooks", "subcategories": [
                {"name": "MacBook Air M1"},
                {"name": "MacBook Air M2"},
                {"name": "MacBook Pro 14"},
                {"name": "MacBook Pro 16"},
                {"name": "MacBook 12"}
            ]},
            {"name": "Apple Watches", "subcategories": [
                {"name": "Series 8"},
                {"name": "Series 7"},
                {"name": "SE"},
                {"name": "Series 6"},
                {"name": "Series 5"}
            ]},
            {"name": "Accessories", "subcategories": [
                {"name": "Chargers"},
                {"name": "Cables"},
                {"name": "Cases"},
                {"name": "AirPods"},
                {"name": "Keyboards"}
            ]}
        ]
    },
    {
        "name": "Смартфоны и гаджеты",  # (Smartphones and Gadgets)
        "subcategories": [
            {"name": "Android Phones", "subcategories": [
                {"name": "Samsung Galaxy S23"},
                {"name": "Google Pixel 7"},
                {"name": "Xiaomi 13"},
                {"name": "OnePlus 11"},
                {"name": "Oppo Find N2"}
            ]},
            {"name": "Smartwatches", "subcategories": [
                {"name": "Samsung Galaxy Watch 5"},
                {"name": "Fitbit Versa 4"},
                {"name": "Garmin Forerunner"},
                {"name": "Huawei Watch GT"},
                {"name": "Amazfit GTS"}
            ]},
            {"name": "Headphones", "subcategories": [
                {"name": "Sony WH-1000XM5"},
                {"name": "Bose QuietComfort"},
                {"name": "JBL Live 660NC"},
                {"name": "Apple AirPods Pro"},
                {"name": "Anker Soundcore"}
            ]},
            {"name": "Fitness Trackers", "subcategories": [
                {"name": "Fitbit Charge 5"},
                {"name": "Xiaomi Mi Band 7"},
                {"name": "Garmin Vivosmart"},
                {"name": "Huawei Band 7"},
                {"name": "Samsung Galaxy Fit"}
            ]},
            {"name": "Smart Home Devices", "subcategories": [
                {"name": "Google Nest Hub"},
                {"name": "Amazon Echo Dot"},
                {"name": "Philips Hue Bulb"},
                {"name": "Ring Video Doorbell"},
                {"name": "TP-Link Tapo Camera"}
            ]}
        ]
    },
    {
        "name": "Для дома",  # (For Home)
        "subcategories": [
            {"name": "Kitchen Appliances", "subcategories": [
                {"name": "Blender"},
                {"name": "Microwave"},
                {"name": "Coffee Maker"},
                {"name": "Toaster"},
                {"name": "Air Fryer"}
            ]},
            {"name": "Furniture", "subcategories": [
                {"name": "Sofa"},
                {"name": "Bed"},
                {"name": "Dining Table"},
                {"name": "Chair"},
                {"name": "Wardrobe"}
            ]},
            {"name": "Home Decor", "subcategories": [
                {"name": "Wall Art"},
                {"name": "Rugs"},
                {"name": "Curtains"},
                {"name": "Vases"},
                {"name": "Candles"}
            ]},
            {"name": "Cleaning Tools", "subcategories": [
                {"name": "Vacuum Cleaner"},
                {"name": "Mop"},
                {"name": "Broom"},
                {"name": "Duster"},
                {"name": "Cleaning Spray"}
            ]},
            {"name": "Lighting", "subcategories": [
                {"name": "LED Bulbs"},
                {"name": "Floor Lamps"},
                {"name": "Ceiling Lights"},
                {"name": "Table Lamps"},
                {"name": "Smart Lights"}
            ]}
        ]
    },
    {
        "name": "Аудио и видео",  # (Audio and Video)
        "subcategories": [
            {"name": "Speakers", "subcategories": [
                {"name": "Bluetooth Speaker"},
                {"name": "Home Theater Speaker"},
                {"name": "Portable Speaker"},
                {"name": "Soundbar"},
                {"name": "Multi-Room Speaker"}
            ]},
            {"name": "Televisions", "subcategories": [
                {"name": "4K TV"},
                {"name": "OLED TV"},
                {"name": "LED TV"},
                {"name": "Smart TV"},
                {"name": "Curved TV"}
            ]},
            {"name": "Sound Systems", "subcategories": [
                {"name": "5.1 Surround System"},
                {"name": "7.1 Surround System"},
                {"name": "Stereo System"},
                {"name": "Wireless System"},
                {"name": "Portable System"}
            ]},
            {"name": "Projectors", "subcategories": [
                {"name": "HD Projector"},
                {"name": "4K Projector"},
                {"name": "Portable Projector"},
                {"name": "Home Cinema Projector"},
                {"name": "Smart Projector"}
            ]},
            {"name": "Cameras", "subcategories": [
                {"name": "DSLR Camera"},
                {"name": "Mirrorless Camera"},
                {"name": "Action Camera"},
                {"name": "Point-and-Shoot"},
                {"name": "Camcorder"}
            ]}
        ]
    },
    {
        "name": "Компьютеры и ноутбуки",  # (Computers and Laptops)
        "subcategories": [
            {"name": "Desktops", "subcategories": [
                {"name": "Gaming Desktop"},
                {"name": "Office Desktop"},
                {"name": "All-in-One"},
                {"name": "Mini PC"},
                {"name": "Workstation"}
            ]},
            {"name": "Laptops", "subcategories": [
                {"name": "Gaming Laptop"},
                {"name": "Ultrabook"},
                {"name": "Business Laptop"},
                {"name": "2-in-1 Laptop"},
                {"name": "Chromebook"}
            ]},
            {"name": "Monitors", "subcategories": [
                {"name": "4K Monitor"},
                {"name": "Curved Monitor"},
                {"name": "UltraWide Monitor"},
                {"name": "Gaming Monitor"},
                {"name": "Portable Monitor"}
            ]},
            {"name": "Keyboards", "subcategories": [
                {"name": "Mechanical Keyboard"},
                {"name": "Wireless Keyboard"},
                {"name": "Gaming Keyboard"},
                {"name": "Ergonomic Keyboard"},
                {"name": "Compact Keyboard"}
            ]},
            {"name": "Gaming PCs", "subcategories": [
                {"name": "High-End Gaming PC"},
                {"name": "Mid-Range Gaming PC"},
                {"name": "Budget Gaming PC"},
                {"name": "Custom Build"},
                {"name": "Prebuilt Gaming PC"}
            ]}
        ]
    },
    {
        "name": "Аксессуары",  # (Accessories)
        "subcategories": [
            {"name": "Phone Cases", "subcategories": [
                {"name": "iPhone Cases"},
                {"name": "Samsung Cases"},
                {"name": "Google Cases"},
                {"name": "Universal Cases"},
                {"name": "Rugged Cases"}
            ]},
            {"name": "Chargers", "subcategories": [
                {"name": "Wireless Chargers"},
                {"name": "USB-C Chargers"},
                {"name": "Wall Chargers"},
                {"name": "Car Chargers"},
                {"name": "Power Banks"}
            ]},
            {"name": "Cables", "subcategories": [
                {"name": "USB-C Cables"},
                {"name": "Lightning Cables"},
                {"name": "HDMI Cables"},
                {"name": "Audio Cables"},
                {"name": "Ethernet Cables"}
            ]},
            {"name": "Headsets", "subcategories": [
                {"name": "Wired Headsets"},
                {"name": "Wireless Headsets"},
                {"name": "Gaming Headsets"},
                {"name": "Noise-Canceling Headsets"},
                {"name": "Over-Ear Headsets"}
            ]},
            {"name": "Bags", "subcategories": [
                {"name": "Backpacks"},
                {"name": "Laptop Bags"},
                {"name": "Handbags"},
                {"name": "Travel Bags"},
                {"name": "Duffel Bags"}
            ]}
        ]
    },
    {
        "name": "Красота и здоровье",  # (Beauty and Health)
        "subcategories": [
            {"name": "Skincare", "subcategories": [
                {"name": "Moisturizers"},
                {"name": "Cleansers"},
                {"name": "Sunscreen"},
                {"name": "Serums"},
                {"name": "Face Masks"}
            ]},
            {"name": "Makeup", "subcategories": [
                {"name": "Foundation"},
                {"name": "Lipstick"},
                {"name": "Eyeshadow"},
                {"name": "Mascara"},
                {"name": "Blush"}
            ]},
            {"name": "Haircare", "subcategories": [
                {"name": "Shampoo"},
                {"name": "Conditioner"},
                {"name": "Hair Oil"},
                {"name": "Hair Masks"},
                {"name": "Styling Products"}
            ]},
            {"name": "Vitamins", "subcategories": [
                {"name": "Vitamin C"},
                {"name": "Omega-3"},
                {"name": "Multivitamins"},
                {"name": "Vitamin D"},
                {"name": "Biotin"}
            ]},
            {"name": "Fitness Equipment", "subcategories": [
                {"name": "Dumbbells"},
                {"name": "Treadmills"},
                {"name": "Yoga Mats"},
                {"name": "Resistance Bands"},
                {"name": "Exercise Bikes"}
            ]}
        ]
    },
    {
        "name": "Развлечения",  # (Entertainment)
        "subcategories": [
            {"name": "Video Games", "subcategories": [
                {"name": "PlayStation Games"},
                {"name": "Xbox Games"},
                {"name": "Nintendo Switch Games"},
                {"name": "PC Games"},
                {"name": "Mobile Games"}
            ]},
            {"name": "Board Games", "subcategories": [
                {"name": "Strategy Games"},
                {"name": "Family Games"},
                {"name": "Party Games"},
                {"name": "Card Games"},
                {"name": "Educational Games"}
            ]},
            {"name": "Puzzles", "subcategories": [
                {"name": "Jigsaw Puzzles"},
                {"name": "3D Puzzles"},
                {"name": "Wooden Puzzles"},
                {"name": "Metal Puzzles"},
                {"name": "Puzzle Books"}
            ]},
            {"name": "Musical Instruments", "subcategories": [
                {"name": "Guitars"},
                {"name": "Pianos"},
                {"name": "Drums"},
                {"name": "Violins"},
                {"name": "Flutes"}
            ]},
            {"name": "Books", "subcategories": [
                {"name": "Fiction"},
                {"name": "Non-Fiction"},
                {"name": "Children’s Books"},
                {"name": "Textbooks"},
                {"name": "Comics"}
            ]}
        ]
    }
]

# Product templates with attributes
PRODUCT_TEMPLATES = {
    "iPhone 14": {
        "name": "iPhone 14 {variant}",
        "description": "Latest iPhone model with advanced features",
        "price": 799.99,
        "stock": 50,
        "brand": "Apple",
        "images": ["/images/iphone14_{variant}.jpg"],
        "memory": "{memory}GB",
        "processor_type": "A15 Bionic",
        "isbn": "12345678{variant_num}",
        "color": "{color}",
        "material": "Glass and Aluminum",
        "size": "6.1 inches",
        "attributes": {
            "screen_resolution": "{resolution}",
            "camera_mp": "{camera}MP",
            "battery_life": "{battery} hours",
            "water_resistance": "{water} meters",
            "wireless_charging": "{wireless}"
        }
    },
    "iPad Pro": {
        "name": "iPad Pro {variant}",
        "description": "Professional tablet with M2 chip",
        "price": 799.00,
        "stock": 30,
        "brand": "Apple",
        "images": ["/images/ipadpro_{variant}.jpg"],
        "memory": "{memory}GB",
        "processor_type": "M2",
        "isbn": "12345679{variant_num}",
        "color": "Space Gray",
        "material": "Aluminum",
        "size": "11 inches",
        "attributes": {
            "display_type": "{display}",
            "refresh_rate": "{refresh}Hz",
            "storage_options": "{storage}GB",
            "apple_pencil_support": "{pencil}",
            "speakers": "{speakers} stereo"
        }
    },
    "MacBook Air M1": {
        "name": "MacBook Air M1 {variant}",
        "description": "Lightweight laptop with M1 chip",
        "price": 999.00,
        "stock": 25,
        "brand": "Apple",
        "images": ["/images/macbookairm1_{variant}.jpg"],
        "memory": "{memory}GB",
        "processor_type": "M1",
        "isbn": "12345680{variant_num}",
        "color": "Space Gray",
        "material": "Aluminum",
        "size": "13.3 inches",
        "attributes": {
            "cpu_cores": "{cores} cores",
            "gpu_cores": "{gpu} cores",
            "ram_speed": "{ram}GB/s",
            "ssd_speed": "{ssd}MB/s",
            "battery_capacity": "{battery}Wh"
        }
    },
    "Series 8": {
        "name": "Apple Watch Series 8 {variant}",
        "description": "Smartwatch with health features",
        "price": 399.00,
        "stock": 40,
        "brand": "Apple",
        "images": ["/images/watchseries8_{variant}.jpg"],
        "memory": "32GB",
        "processor_type": "S8",
        "isbn": "12345681{variant_num}",
        "color": "{color}",
        "material": "Aluminum",
        "size": "41mm",
        "attributes": {
            "heart_rate_monitor": "{heart}",
            "blood_oxygen_sensor": "{oxygen}",
            "gps": "{gps}",
            "fall_detection": "{fall}",
            "ecg": "{ecg}"
        }
    },
    "Chargers": {
        "name": "Apple Charger {variant}",
        "description": "Charging accessory for Apple devices",
        "price": 29.99,
        "stock": 100,
        "brand": "Apple",
        "images": ["/images/charger_{variant}.jpg"],
        "memory": "N/A",
        "processor_type": "N/A",
        "isbn": "12345682{variant_num}",
        "color": "White",
        "material": "Plastic",
        "size": "N/A",
        "attributes": {
            "output_power": "{power}W",
            "ports": "{ports}",
            "cable_length": "{length}cm",
            "fast_charging": "{fast}",
            "compatibility": "{compat}"
        }
    },
    "Samsung Galaxy S23": {
        "name": "Samsung Galaxy S23 {variant}",
        "description": "Flagship Android phone",
        "price": 799.99,
        "stock": 40,
        "brand": "Samsung",
        "images": ["/images/s23_{variant}.jpg"],
        "memory": "{memory}GB",
        "processor_type": "Snapdragon 8 Gen 2",
        "isbn": "12345683{variant_num}",
        "color": "{color}",
        "material": "Glass and Plastic",
        "size": "6.1 inches",
        "attributes": {
            "screen_resolution": "{resolution}",
            "camera_mp": "{camera}MP",
            "battery_capacity": "{battery}mAh",
            "refresh_rate": "{refresh}Hz",
            "s_pen_support": "{s_pen}"
        }
    },
    "Blender": {
        "name": "Blender {variant}",
        "description": "Kitchen appliance for blending",
        "price": 49.99,
        "stock": 50,
        "brand": "Generic",
        "images": ["/images/blender_{variant}.jpg"],
        "memory": "N/A",
        "processor_type": "N/A",
        "isbn": "12345684{variant_num}",
        "color": "{color}",
        "material": "Plastic",
        "size": "N/A",
        "attributes": {
            "power": "{power}W",
            "speed_settings": "{speed}",
            "capacity": "{capacity}L",
            "blade_material": "{blade}",
            "dishwasher_safe": "{dishwasher}"
        }
    },
    "4K TV": {
        "name": "4K TV {variant}",
        "description": "High-resolution television",
        "price": 599.99,
        "stock": 20,
        "brand": "Generic",
        "images": ["/images/4ktv_{variant}.jpg"],
        "memory": "N/A",
        "processor_type": "N/A",
        "isbn": "12345685{variant_num}",
        "color": "Black",
        "material": "Plastic",
        "size": "55 inches",
        "attributes": {
            "resolution": "3840x2160",
            "hdr_support": "{hdr}",
            "refresh_rate": "{refresh}Hz",
            "smart_features": "{smart}",
            "ports": "{ports}"
        }
    },
    "Gaming Laptop": {
        "name": "Gaming Laptop {variant}",
        "description": "High-performance gaming laptop",
        "price": 1299.99,
        "stock": 15,
        "brand": "Generic",
        "images": ["/images/gaminglaptop_{variant}.jpg"],
        "memory": "{memory}GB",
        "processor_type": "Intel i7",
        "isbn": "12345686{variant_num}",
        "color": "Black",
        "material": "Aluminum",
        "size": "15.6 inches",
        "attributes": {
            "gpu": "{gpu}",
            "ram": "{ram}GB",
            "storage": "{storage}GB SSD",
            "display_refresh": "{refresh}Hz",
            "cooling_system": "{cooling}"
        }
    },
    "Moisturizers": {
        "name": "Moisturizer {variant}",
        "description": "Skin hydration product",
        "price": 19.99,
        "stock": 100,
        "brand": "Generic",
        "images": ["/images/moisturizer_{variant}.jpg"],
        "memory": "N/A",
        "processor_type": "N/A",
        "isbn": "12345687{variant_num}",
        "color": "White",
        "material": "Cream",
        "size": "50ml",
        "attributes": {
            "skin_type": "{skin}",
            "ingredients": "{ingredients}",
            "spf": "{spf}",
            "texture": "{texture}",
            "volume": "{volume}ml"
        }
    }
    # Add more templates for other sub-subcategory types as needed (e.g., "Google Pixel 7", "Sofa", etc.)
}

async def create_category(session, url, data):
    async with session.post(url, json=data, headers=HEADERS) as response:
        if response.status == 201:
            result = await response.json()
            print(f"Category creation response: {result}")  # Debug print
            return result.get("id") or result.get("_id")  # Try both keys
        else:
            print(f"Failed to create category: {data}, Status: {response.status}, Response: {await response.text()}")
            return None

async def create_product(session, url, data):
    async with session.post(url, json=data, headers=HEADERS) as response:
        if response.status == 201:
            result = await response.json()
            print(f"Product creation response: {result}")  # Debug print
            return result.get("id") or result.get("_id")  # Try both keys
        else:
            print(f"Failed to create product: {data}, Status: {response.status}, Response: {await response.text()}")
            return None

async def create_hierarchy(session):
    parent_ids = {}
    subcat_ids = {}
    subsubcat_ids = {}
    
    # Create parent categories
    for parent in CATEGORY_DATA:
        parent_id = await create_category(session, f"{BASE_URL}/categories/parent", {"name": parent["name"]})
        if parent_id:
            parent_ids[parent["name"]] = parent_id
            print(f"Created parent category: {parent['name']} with ID: {parent_id}")
    
    # Create subcategories and sub-subcategories
    for parent in CATEGORY_DATA:
        parent_id = parent_ids[parent["name"]]
        for sub in parent.get("subcategories", []):
            sub_data = {"name": sub["name"], "parent_id": parent_id}
            sub_id = await create_category(session, f"{BASE_URL}/categories/child", sub_data)
            if sub_id:
                subcat_ids[(parent["name"], sub["name"])] = sub_id
                print(f"Created subcategory: {sub['name']} with ID: {sub_id} under {parent['name']}")
                for sub_sub in sub.get("subcategories", []):
                    sub_sub_data = {"name": sub_sub["name"], "parent_id": sub_id}
                    sub_sub_id = await create_category(session, f"{BASE_URL}/categories/child", sub_sub_data)
                    if sub_sub_id:
                        subsubcat_ids[(parent["name"], sub["name"], sub_sub["name"])] = sub_sub_id
                        print(f"Created sub-subcategory: {sub_sub['name']} with ID: {sub_sub_id} under {sub['name']}")
    
    # Create products for each sub-subcategory
    for parent in CATEGORY_DATA:
        for sub in parent.get("subcategories", []):
            for sub_sub in sub.get("subcategories", []):
                sub_subcat_id = subsubcat_ids[(parent["name"], sub["name"], sub_sub["name"])]
                template_key = sub_sub["name"]  # Use sub-subcategory name to match template
                if template_key in PRODUCT_TEMPLATES:
                    template = PRODUCT_TEMPLATES[template_key]
                    for i in range(5):  # Create 5 products
                        variant = f"Variant{i+1}"
                        memory = "128" if i % 2 == 0 else "256"
                        color = ["Black", "White", "Blue", "Red", "Green"][i % 5]
                        # Dynamic attributes based on index
                        attributes = {}
                        if "screen_resolution" in template["attributes"]:
                            attributes["screen_resolution"] = ["1920x1080", "2532x1170", "2778x1284", "2556x1179", "2688x1242"][i % 5]
                        if "camera_mp" in template["attributes"]:
                            attributes["camera_mp"] = ["12", "48", "50", "108", "64"][i % 5]
                        if "battery_life" in template["attributes"]:
                            attributes["battery_life"] = ["10", "12", "15", "18", "20"][i % 5]
                        if "water_resistance" in template["attributes"]:
                            attributes["water_resistance"] = ["1", "3", "5", "6", "10"][i % 5]
                        if "wireless_charging" in template["attributes"]:
                            attributes["wireless_charging"] = ["Yes", "No"][i % 2]
                        if "display_type" in template["attributes"]:
                            attributes["display_type"] = ["LCD", "OLED", "Mini LED", " Retina", "Liquid Retina"][i % 5]
                        if "refresh_rate" in template["attributes"]:
                            attributes["refresh_rate"] = ["60", "90", "120", "144", "240"][i % 5]
                        if "storage_options" in template["attributes"]:
                            attributes["storage_options"] = ["128", "256", "512", "1TB", "2TB"][i % 5]
                        if "apple_pencil_support" in template["attributes"]:
                            attributes["apple_pencil_support"] = ["Yes", "No", "2nd Gen", "1st Gen", "USB-C"][i % 5]
                        if "speakers" in template["attributes"]:
                            attributes["speakers"] = ["2", "4", "6", "8", "10"][i % 5]
                        if "cpu_cores" in template["attributes"]:
                            attributes["cpu_cores"] = ["4", "6", "8", "10", "12"][i % 5]
                        if "gpu_cores" in template["attributes"]:
                            attributes["gpu_cores"] = ["4", "6", "8", "10", "12"][i % 5]
                        if "ram_speed" in template["attributes"]:
                            attributes["ram_speed"] = ["3200", "4266", "4800", "5200", "6400"][i % 5]
                        if "ssd_speed" in template["attributes"]:
                            attributes["ssd_speed"] = ["2500", "3000", "3500", "4000", "5000"][i % 5]
                        if "battery_capacity" in template["attributes"]:
                            attributes["battery_capacity"] = ["50", "60", "70", "80", "100"][i % 5]
                        if "heart_rate_monitor" in template["attributes"]:
                            attributes["heart_rate_monitor"] = ["Yes", "No"][i % 2]
                        if "blood_oxygen_sensor" in template["attributes"]:
                            attributes["blood_oxygen_sensor"] = ["Yes", "No"][i % 2]
                        if "gps" in template["attributes"]:
                            attributes["gps"] = ["Yes", "No"][i % 2]
                        if "fall_detection" in template["attributes"]:
                            attributes["fall_detection"] = ["Yes", "No"][i % 2]
                        if "ecg" in template["attributes"]:
                            attributes["ecg"] = ["Yes", "No"][i % 2]
                        if "output_power" in template["attributes"]:
                            attributes["output_power"] = ["20", "30", "40", "60", "100"][i % 5]
                        if "ports" in template["attributes"]:
                            attributes["ports"] = ["1", "2", "3", "4", "5"][i % 5]
                        if "cable_length" in template["attributes"]:
                            attributes["cable_length"] = ["100", "150", "200", "250", "300"][i % 5]
                        if "fast_charging" in template["attributes"]:
                            attributes["fast_charging"] = ["Yes", "No"][i % 2]
                        if "compatibility" in template["attributes"]:
                            attributes["compatibility"] = ["iPhone", "Android", "Universal", "Mac", "iPad"][i % 5]
                        if "battery_capacity" in template["attributes"]:  # For phones
                            attributes["battery_capacity"] = ["4000", "4500", "5000", "5500", "6000"][i % 5]
                        if "refresh_rate" in template["attributes"]:  # For phones
                            attributes["refresh_rate"] = ["60", "90", "120", "144", "165"][i % 5]
                        if "s_pen_support" in template["attributes"]:
                            attributes["s_pen_support"] = ["Yes", "No"][i % 2]
                        if "power" in template["attributes"]:
                            attributes["power"] = ["500", "700", "900", "1100", "1500"][i % 5]
                        if "speed_settings" in template["attributes"]:
                            attributes["speed_settings"] = ["2", "3", "5", "7", "10"][i % 5]
                        if "capacity" in template["attributes"]:
                            attributes["capacity"] = ["0.5", "1.0", "1.5", "2.0", "2.5"][i % 5]
                        if "blade_material" in template["attributes"]:
                            attributes["blade_material"] = ["Stainless Steel", "Titanium", "Ceramic", "Alloy", "Carbon Steel"][i % 5]
                        if "dishwasher_safe" in template["attributes"]:
                            attributes["dishwasher_safe"] = ["Yes", "No"][i % 2]
                        if "hdr_support" in template["attributes"]:
                            attributes["hdr_support"] = ["HDR10", "Dolby Vision", "HLG", "No", "HDR10+"][i % 5]
                        if "smart_features" in template["attributes"]:
                            attributes["smart_features"] = ["Yes", "No", "Alexa", "Google Assistant", "Apple TV"][i % 5]
                        if "gpu" in template["attributes"]:
                            attributes["gpu"] = ["NVIDIA RTX 3060", "NVIDIA RTX 3070", "AMD RX 6700", "NVIDIA RTX 3080", "AMD RX 6800"][i % 5]
                        if "ram" in template["attributes"]:
                            attributes["ram"] = ["16", "32", "64", "8", "128"][i % 5]
                        if "storage" in template["attributes"]:
                            attributes["storage"] = ["512", "1024", "2048", "256", "4096"][i % 5]
                        if "display_refresh" in template["attributes"]:
                            attributes["display_refresh"] = ["60", "120", "144", "165", "240"][i % 5]
                        if "cooling_system" in template["attributes"]:
                            attributes["cooling_system"] = ["Air", "Liquid", "Hybrid", "Passive", "Active"][i % 5]
                        if "skin_type" in template["attributes"]:
                            attributes["skin_type"] = ["Dry", "Oily", "Combination", "Sensitive", "Normal"][i % 5]
                        if "ingredients" in template["attributes"]:
                            attributes["ingredients"] = ["Hyaluronic Acid", "Glycerin", "Aloe Vera", "Vitamin E", "Shea Butter"][i % 5]
                        if "spf" in template["attributes"]:
                            attributes["spf"] = ["15", "30", "50", "None", "100"][i % 5]
                        if "texture" in template["attributes"]:
                            attributes["texture"] = ["Cream", "Gel", "Lotion", "Oil", "Balm"][i % 5]
                        if "volume" in template["attributes"]:
                            attributes["volume"] = ["30", "50", "100", "200", "500"][i % 5]

                        product_data = template.copy()
                        product_data["name"] = product_data["name"].format(variant=variant)
                        product_data["description"] = product_data["description"] + f" - {variant}"
                        product_data["images"][0] = product_data["images"][0].format(variant=variant.lower())
                        product_data["memory"] = product_data["memory"].format(memory=memory) if "{memory}" in product_data["memory"] else product_data["memory"]
                        product_data["isbn"] = product_data["isbn"].format(variant_num=str(i).zfill(2))
                        product_data["color"] = color if "{color}" in product_data["color"] else product_data["color"]
                        product_data["attributes"] = attributes
                        product_data["category_id"] = sub_subcat_id
                        product_id = await create_product(session, BASE_URL, product_data)
                        if product_id:
                            print(f"Created product: {product_data['name']} with ID: {product_id}")

async def main():
    async with aiohttp.ClientSession() as session:
        await create_hierarchy(session)

if __name__ == "__main__":
    print("Starting category and product creation. Ensure the server is running at http://127.0.0.1:8002")
    asyncio.run(main())
    print("Category and product creation completed.")