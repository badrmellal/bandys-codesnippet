# Bandys Cars | Skyscanner Car Hire Partner Integration

**Supplier:** Bandys Cars  
**Country:** Morocco  
**Currency:** USD (US Dollar)  
**Website:** https://bandyscars.com  
**Contact:** admin@bandyscars.com

---

## Partnership Model

Bandys Cars integrates with Skyscanner as a **Deeplink Partner**:

1. **Skyscanner** displays our vehicle inventory to users searching for car hire in Morocco
2. **Users** click on a Bandys Cars offer and are redirected to our website with pre-filled booking details
3. **Booking** is completed directly on bandyscars.com
4. **Attribution** is tracked via URL parameters (`ref=skyscanner`) for reporting

**Coverage:** We deliver vehicles to **any location in Morocco**. Our entire fleet is available at all pickup points.

---

## Authentication

All API requests require an API key header:

```
x-api-key: WILL_BE_SENT_SEPERATELY
```

---

## Endpoints

### 1. GET /inventory

Returns available vehicles with pricing and booking deeplinks.

**URL:** `https://bandyscars.com/api/skyscanner/inventory`

**Parameters:**

| Parameter        | Type    | Required | Description                              |
| ---------------- | ------- | -------- | ---------------------------------------- |
| pickup_location  | string  | No       | IATA airport code (e.g., RAK, CMN)       |
| dropoff_location | string  | No       | IATA code (defaults to pickup)           |
| pickup_date      | string  | No       | YYYY-MM-DD format                        |
| dropoff_date     | string  | No       | YYYY-MM-DD format                        |
| vehicle_type     | string  | No       | Vehicle category filter                  |
| currency         | string  | No       | Default: USD                             |
| limit            | integer | No       | Results per page (default: 50, max: 100) |
| offset           | integer | No       | Pagination offset (default: 0)           |

**Note:** Location parameters affect the displayed pickup location in responses but do not filter results. All vehicles are available at all locations as we offer delivery across Morocco.

**Example Request:**
```bash
curl -H "x-api-key: API_KEY_PROVIDED_ABOVE" \
  "https://bandyscars.com/api/skyscanner/inventory?pickup_location=RAK&pickup_date=2025-02-01&dropoff_date=2025-02-08"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "vehicle_id": "BD-C1001",
        "supplier": {
          "name": "Bandys Cars",
          "logo_url": "https://bandyscars.com/logo.png",
          "rating": 4.8
        },
        "vehicle": {
          "make": "Volkswagen",
          "model": "T-Roc",
          "year": 2024,
          "category": "SUV",
          "transmission": "automatic",
          "fuel_type": "petrol",
          "fuel_policy": "full_to_full",
          "seats": 5,
          "doors": 4,
          "luggage": {
            "large": 2,
            "small": 1
          },
          "air_conditioning": true,
          "unlimited_mileage": true
        },
        "pricing": {
          "currency": "USD",
          "price_per_day": 67.50,
          "weekend_price_per_day": 67.50,
          "total_price": 472.50,
          "includes_insurance": true,
          "insurance_type": "basic"
        },
        "location": {
          "pickup": {
            "code": "RAK",
            "name": "Marrakech",
            "address": "Marrakech Menara Airport",
            "country": "MA"
          },
          "dropoff": {
            "code": "RAK",
            "name": "Marrakech",
            "address": "Marrakech Menara Airport",
            "country": "MA"
          }
        },
        "images": [
          "https://d2twk0nccgfyqu.cloudfront.net/vehicles/vw-troc.webp"
        ],
        "features": {
          "bluetooth": true,
          "gps": true,
          "usb": true,
          "apple_carplay": true,
          "android_auto": true,
          "backup_camera": true,
          "cruise_control": true
        },
        "deep_link": "https://bandyscars.com/en-US/cars/BD-C1001?ref=skyscanner&startDate=2025-02-01&endDate=2025-02-08&pickupLocation=Marrakech%20Menara%20Airport",
        "available": true
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 50,
      "offset": 0,
      "has_more": false
    },
    "meta": {
      "supplier": "Bandys Cars",
      "country": "Morocco",
      "currency": "USD",
      "generated_at": "2025-02-01T10:00:00.000Z"
    }
  }
}
```

---

### 2. GET /availability

Check real-time vehicle availability for specific dates. Returns only vehicles without conflicting bookings.

**URL:** `https://bandyscars.com/api/skyscanner/availability`

**Parameters:**

| Parameter       | Type   | Required | Description                        |
| --------------- | ------ | -------- | ---------------------------------- |
| pickup_date     | string | **Yes**  | YYYY-MM-DD format                  |
| dropoff_date    | string | **Yes**  | YYYY-MM-DD format                  |
| pickup_location | string | No       | IATA airport code                  |
| pickup_time     | string | No       | HH:MM format (default: 10:00)      |
| dropoff_time    | string | No       | HH:MM format (default: 10:00)      |
| vehicle_id      | string | No       | Check availability of specific car |

**Validation:**
- `pickup_date` cannot be in the past
- `dropoff_date` must be after `pickup_date`

**Example Request:**
```bash
curl -H "x-api-key: API_KEY_PROVIDED_ABOVE" \
  "https://bandyscars.com/api/skyscanner/availability?pickup_location=RBA&pickup_date=2025-02-01&dropoff_date=2025-02-08&pickup_time=10:00&dropoff_time=10:00"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "search_params": {
      "pickup_location": "RBA",
      "pickup_date": "2025-02-01",
      "pickup_time": "10:00",
      "dropoff_date": "2025-02-08",
      "dropoff_time": "10:00",
      "rental_days": 7
    },
    "availability": {
      "available_count": 5,
      "total_fleet": 5,
      "availability_percentage": 100,
      "vehicles": [
        {
          "vehicle_id": "BD-C1001",
          "available": true,
          "make": "Volkswagen",
          "model": "T-Roc",
          "category": "SUV",
          "location": {
            "code": "RBA",
            "name": "Rabat"
          },
          "pricing": {
            "currency": "USD",
            "daily_rate": 67.50,
            "weekend_rate": 67.50,
            "rental_days": 7,
            "estimated_total": 472.50
          },
          "features": {
            "seats": 5,
            "doors": 4,
            "transmission": "automatic",
            "air_conditioning": true
          },
          "deep_link": "https://bandyscars.com/en-US/cars/BD-C1001?ref=skyscanner&startDate=2025-02-01&endDate=2025-02-08&pickupTime=10:00&dropoffTime=10:00&pickupLocation=Rabat-Sal%C3%A9%20Airport"
        }
      ]
    },
    "meta": {
      "supplier": "Bandys Cars",
      "country": "Morocco",
      "currency": "USD",
      "checked_at": "2025-02-01T10:00:00.000Z"
    }
  }
}
```

---

### 3. GET /locations

Returns all supported pickup/dropoff locations in Morocco.

**URL:** `https://bandyscars.com/api/skyscanner/locations`

**Parameters:**

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| type      | string | No       | `airport`, `city`, or `all`       |
| city      | string | No       | Filter by city name               |

**Example Request:**
```bash
curl -H "x-api-key: API_KEY_PROVIDED_ABOVE" \
  "https://bandyscars.com/api/skyscanner/locations?type=airport"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "code": "CMN",
        "name": "Mohammed V International Airport",
        "city": "Casablanca",
        "country": "Morocco",
        "country_code": "MA",
        "type": "airport",
        "coordinates": {
          "lat": 33.3675,
          "lng": -7.5898
        },
        "timezone": "Africa/Casablanca",
        "available_vehicles": 5,
        "supported": true,
        "delivery_available": true,
        "pickup_instructions": "Meet our representative at Mohammed V International Airport arrivals hall. Look for the Bandys Cars sign.",
        "operating_hours": {
          "monday": { "open": "08:00", "close": "22:00" },
          "tuesday": { "open": "08:00", "close": "22:00" },
          "wednesday": { "open": "08:00", "close": "22:00" },
          "thursday": { "open": "08:00", "close": "22:00" },
          "friday": { "open": "08:00", "close": "22:00" },
          "saturday": { "open": "08:00", "close": "22:00" },
          "sunday": { "open": "08:00", "close": "22:00" }
        },
        "after_hours_available": true,
        "after_hours_fee": 50
      },
      {
        "code": "RAK",
        "name": "Marrakech Menara Airport",
        "city": "Marrakech",
        "country": "Morocco",
        "country_code": "MA",
        "type": "airport",
        "coordinates": {
          "lat": 31.6069,
          "lng": -8.0363
        },
        "timezone": "Africa/Casablanca",
        "available_vehicles": 5,
        "supported": true,
        "delivery_available": true,
        "pickup_instructions": "Meet our representative at Marrakech Menara Airport arrivals hall. Look for the Bandys Cars sign.",
        "operating_hours": {
          "monday": { "open": "08:00", "close": "22:00" },
          "tuesday": { "open": "08:00", "close": "22:00" },
          "wednesday": { "open": "08:00", "close": "22:00" },
          "thursday": { "open": "08:00", "close": "22:00" },
          "friday": { "open": "08:00", "close": "22:00" },
          "saturday": { "open": "08:00", "close": "22:00" },
          "sunday": { "open": "08:00", "close": "22:00" }
        },
        "after_hours_available": true,
        "after_hours_fee": 50
      }
    ],
    "summary": {
      "total_locations": 21,
      "airport_locations": 9,
      "city_locations": 12,
      "total_fleet": 5,
      "coverage": "All of Morocco - we deliver anywhere"
    },
    "meta": {
      "supplier": "Bandys Cars",
      "country": "Morocco",
      "currency": "USD",
      "generated_at": "2025-02-01T10:00:00.000Z"
    }
  }
}
```

---

### 4. GET /bookings

Retrieve Skyscanner-attributed bookings for reporting and reconciliation.

**URL:** `https://bandyscars.com/api/skyscanner/bookings`

**Parameters:**

| Parameter   | Type   | Required | Description                      |
| ----------- | ------ | -------- | -------------------------------- |
| date_from   | string | No       | Start date filter (YYYY-MM-DD)   |
| date_to     | string | No       | End date filter (YYYY-MM-DD)     |
| redirect_id | string | No       | Filter by Skyscanner redirect ID |

**Example Request:**
```bash
curl -H "x-api-key: API_KEY_PROVIDED_ABOVE" \
  "https://bandyscars.com/api/skyscanner/bookings?date_from=2025-01-01&date_to=2025-01-31"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "report_period": {
      "start_date": "2025-01-01",
      "end_date": "2025-01-31"
    },
    "summary": {
      "total_bookings": 25,
      "confirmed_bookings": 22,
      "cancelled_bookings": 3,
      "total_revenue": 12500,
      "average_booking_value": 500
    },
    "bookings": [
      {
        "booking_id": "BK-20250115-ABC123",
        "status": "CONFIRMED",
        "skyscanner_redirect_id": "abc123xyz",
        "vehicle": {
          "id": "BD-C1001",
          "make": "Volkswagen",
          "model": "T-Roc",
          "category": "SUV"
        },
        "dates": {
          "pickup": "2025-01-15T10:00:00.000Z",
          "dropoff": "2025-01-22T10:00:00.000Z",
          "rental_days": 7
        },
        "location": {
          "pickup": "Marrakech Menara Airport",
          "dropoff": "Marrakech Menara Airport"
        },
        "pricing": {
          "currency": "USD",
          "total_amount": 472.50
        },
        "created_at": "2025-01-10T14:25:00.000Z"
      }
    ],
    "meta": {
      "supplier": "Bandys Cars",
      "generated_at": "2025-02-01T10:00:00.000Z",
      "currency": "USD"
    }
  }
}
```

---

## Supported Locations

### Airports (IATA Codes)

| Code | Airport Name                      | City       |
| ---- | --------------------------------- | ---------- |
| CMN  | Mohammed V International Airport  | Casablanca |
| RAK  | Marrakech Menara Airport          | Marrakech  |
| AGA  | Agadir Al Massira Airport         | Agadir     |
| FEZ  | Fes-Saiss Airport                 | Fes        |
| TNG  | Tangier Ibn Battouta Airport      | Tangier    |
| RBA  | Rabat-Salé Airport                | Rabat      |
| OUD  | Angads Airport                    | Oujda      |
| NDR  | Nador International Airport       | Nador      |
| ESU  | Essaouira-Mogador Airport         | Essaouira  |

### City Centers

| Code    | Location                |
| ------- | ----------------------- |
| CMN_CTY | Casablanca City Center  |
| RAK_CTY | Marrakech City Center   |
| AGA_CTY | Agadir City Center      |
| FEZ_CTY | Fes City Center         |
| TNG_CTY | Tangier City Center     |
| RBA_CTY | Rabat City Center       |
| OUD_CTY | Oujda City Center       |
| NDR_CTY | Nador City Center       |
| ESU_CTY | Essaouira City Center   |
| CHF_CTY | Chefchaouen City Center |
| OZT_CTY | Ouarzazate City Center  |
| MKN_CTY | Meknes City Center      |

**Important:** We deliver to **any location in Morocco**. The entire fleet is available at all pickup points, location selection only affects the designated meeting point.

---

## Deeplink Structure

All API responses include a `deep_link` field that redirects users to our booking page with pre-filled details:

```
https://bandyscars.com/en-US/cars/{vehicle_id}?ref=skyscanner&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&pickupTime=HH:MM&dropoffTime=HH:MM&pickupLocation={location_name}
```

### URL Parameters

| Parameter             | Description                              | Example                        |
| --------------------- | ---------------------------------------- | ------------------------------ |
| ref                   | Referral source (always `skyscanner`)    | `skyscanner`                   |
| startDate             | Pickup date                              | `2025-02-01`                   |
| endDate               | Return date                              | `2025-02-08`                   |
| pickupTime            | Pickup time (HH:MM)                      | `10:00`                        |
| dropoffTime           | Return time (HH:MM)                      | `10:00`                        |
| pickupLocation        | Pickup location name (URL encoded)       | `Marrakech%20Menara%20Airport` |
| skyscanner_redirectid | Your tracking ID for attribution         | `abc123xyz`                    |

### User Experience

When users click the deeplink:
1. They land on the selected vehicle booking page
2. Dates, times, and location are **automatically pre-filled**
3. Users proceed directly to add-ons and payment
4. Booking is tracked with `ref=skyscanner` for attribution

---

## Error Responses

All errors return a consistent JSON structure:

| Status | Error                 | Description                     |
| ------ | --------------------- | ------------------------------- |
| 400    | Bad Request           | Missing or invalid parameters   |
| 401    | Unauthorized          | Invalid or missing API key      |
| 404    | Not Found             | Resource not found              |
| 500    | Internal Server Error | Server-side error               |

**Example Error Response:**
```json
{
  "error": "Bad Request",
  "message": "pickup_date and dropoff_date are required"
}
```

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

---

## Pricing Information

| Item                | Details                                      |
| ------------------- | -------------------------------------------- |
| **Currency**        | USD (US Dollar)                              |
| **Weekend Pricing** | Some vehicles have different weekend rates   |
| **Insurance**       | Basic insurance included in all prices       |
| **Fuel Policy**     | Full-to-full (return with same fuel level)   |
| **After Hours**     | Available with next day fee                  |
| **Delivery**        | Free delivery to any location in Morocco     |

---

## Rate Limits

| Endpoint      | Rate Limit            |
| ------------- | --------------------- |
| /inventory    | 1000 requests/minute  |
| /availability | 1000 requests/minute  |
| /locations    | 1000 requests/minute  |
| /bookings     | 500 requests/minute   |

---

## Support

**Technical Support:** admin@bandyscars.com  
**Response Time:** Within 24 hours

---

*Documentation Version: 1.0*  
*Last Updated: December 2025*  
*© 2025 Bandys Cars - All Rights Reserved*
