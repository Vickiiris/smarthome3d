# 智能家居3D可视化系统 - 后端接口文档

**版本**: v1.0  
**更新日期**: 2026-04-20  
**Base URL**: `https://api.example.com/v1`

---

## 接口说明

### 认证方式
- **Bearer Token**：在请求头中携带 `Authorization: Bearer <token>`
- Token 通过登录接口获取，有效期 7 天

### 请求格式
- Content-Type: `application/json`
- 编码: UTF-8

### 响应格式
所有接口返回统一格式：
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 状态码
| code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 / Token 过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 1. 设备管理

### 1.1 获取设备列表
获取所有设备的状态和信息。

**请求**
```
GET /devices
```

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "dev1",
      "name": "客厅空调",
      "icon": "❄️",
      "room": "客厅",
      "vendor": "三星",
      "ip": "192.168.1.47",
      "online": true,
      "status": true,
      "type": "ac",
      "value": 24,
      "mode": "cool",
      "fanSpeed": "auto",
      "updatedAt": "2026-04-20T10:30:00Z"
    }
  ]
}
```

**设备类型说明**
| type | 说明 | 可控制属性 |
|------|------|-----------|
| `ac` | 空调 | status, value(温度), mode, fanSpeed |
| `light` | 照明 | status, value(亮度) |
| `tv` | 电视 | status, value(音量), mode |
| `speaker` | 音箱 | status, value(音量) |
| `outlet` | 插座 | status |
| `sensor` | 传感器 | 只读状态 |
| `security` | 安防设备 | status, value |
| `ventil` | 新风/抽油烟机 | status, value(档位) |
| `washer` | 洗碗机 | status, mode |
| `heater` | 热水器 | status, value(温度) |

---

### 1.2 获取单个设备详情
```
GET /devices/{id}
```

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "dev1",
    "name": "客厅空调",
    "icon": "❄️",
    "room": "客厅",
    "vendor": "三星",
    "ip": "192.168.1.47",
    "protocol": "Wi-Fi",
    "firmware": "v3.2.1",
    "online": true,
    "status": true,
    "type": "ac",
    "value": 24,
    "mode": "cool",
    "fanSpeed": "auto",
    "createdAt": "2024-01-15T08:00:00Z",
    "updatedAt": "2026-04-20T10:30:00Z"
  }
}
```

---

### 1.3 控制设备
发送控制命令到指定设备。

**请求**
```
POST /devices/{id}/control
```

**请求体**
```json
{
  "status": true,
  "value": 26,
  "mode": "cool",
  "fanSpeed": "high"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | boolean | 否 | 开关状态 |
| value | number | 否 | 主数值（温度/亮度/音量） |
| mode | string | 否 | 模式（cool/heat/auto/fan） |
| fanSpeed | string | 否 | 风速（auto/low/medium/high） |

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "dev1",
    "status": true,
    "value": 26,
    "mode": "cool",
    "fanSpeed": "high",
    "updatedAt": "2026-04-20T10:35:00Z"
  }
}
```

---

### 1.4 新增设备
```
POST /devices
```

**请求体**
```json
{
  "name": "卧室灯开关",
  "icon": "💡",
  "room": "主卧",
  "vendor": "小米",
  "ip": "192.168.1.100",
  "type": "light",
  "protocol": "Zigbee 3.0"
}
```

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "dev30",
    "name": "卧室灯开关",
    "icon": "💡",
    "room": "主卧",
    "vendor": "小米",
    "ip": "192.168.1.100",
    "type": "light",
    "status": false,
    "value": 0,
    "online": false,
    "createdAt": "2026-04-20T10:40:00Z"
  }
}
```

---

### 1.5 删除设备
```
DELETE /devices/{id}
```

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 2. 环境监测

### 2.1 获取环境数据
获取室内外环境传感器数据。

**请求**
```
GET /environment
```

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "indoor": {
      "temperature": 24,
      "humidity": 50,
      "co2": 450,
      "pm25": 12,
      "light": 320,
      "airQuality": "优"
    },
    "outdoor": {
      "temperature": 32,
      "humidity": 65,
      "weather": "晴",
      "aqi": 45
    },
    "updatedAt": "2026-04-20T10:30:00Z"
  }
}
```

---

### 2.2 获取历史数据
获取环境数据的趋势历史。

**请求**
```
GET /environment/history?type=temperature&range=day
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 数据类型：temperature/humidity/co2/pm25/light |
| range | string | 否 | 时间范围：day(24h)/week(7d)/month(30d)，默认 day |

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "type": "temperature",
    "range": "day",
    "unit": "°C",
    "dataPoints": [
      { "timestamp": "2026-04-20T00:00:00Z", "value": 23.5 },
      { "timestamp": "2026-04-20T01:00:00Z", "value": 23.2 },
      { "timestamp": "2026-04-20T02:00:00Z", "value": 22.8 }
    ],
    "stats": {
      "min": 22.5,
      "max": 25.8,
      "avg": 24.1
    }
  }
}
```

---

## 3. 能源管理

### 3.1 获取能源概览
获取今日能源使用概览。

**请求**
```
GET /energy
```

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "today": {
      "electricity": {
        "value": 8.5,
        "unit": "kWh",
        "cost": 5.10,
        "trend": 5.2
      },
      "water": {
        "value": 0.8,
        "unit": "m³",
        "cost": 2.80,
        "trend": -3.2
      },
      "gas": {
        "value": 0.45,
        "unit": "m³",
        "cost": 1.26,
        "trend": 2.1
      }
    },
    "realtime": {
      "power": 2.3,
      "waterFlow": 0.5,
      "gasFlow": 0.1
    },
    "carbonReduction": 12.5,
    "savingRate": 18,
    "updatedAt": "2026-04-20T10:30:00Z"
  }
}
```

---

### 3.2 获取用电趋势
获取用电量的历史趋势。

**请求**
```
GET /energy/electricity?range=week
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| range | string | 否 | day/week/month，默认 day |

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "range": "week",
    "dataPoints": [
      { "date": "2026-04-14", "value": 7.2 },
      { "date": "2026-04-15", "value": 8.5 },
      { "date": "2026-04-16", "value": 9.1 }
    ],
    "total": 55.8,
    "totalCost": 33.48,
    "avgDaily": 7.97
  }
}
```

---

### 3.3 获取用电结构
获取各设备/房间的用电占比。

**请求**
```
GET /energy/electricity/breakdown
```

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "byDevice": [
      { "name": "空调", "value": 45, "unit": "%" },
      { "name": "冰箱", "value": 25, "unit": "%" },
      { "name": "照明", "value": 15, "unit": "%" },
      { "name": "其他", "value": 15, "unit": "%" }
    ],
    "byRoom": [
      { "name": "客厅", "value": 35, "unit": "%" },
      { "name": "主卧", "value": 25, "unit": "%" },
      { "name": "厨房", "value": 18, "unit": "%" },
      { "name": "次卧", "value": 15, "unit": "%" },
      { "name": "其他", "value": 7, "unit": "%" }
    ]
  }
}
```

---

### 3.4 获取费用明细
获取月度费用明细。

**请求**
```
GET /energy/bill?month=2026-04
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| month | string | 否 | 格式 YYYY-MM，默认当月 |

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "month": "2026-04",
    "electricity": {
      "usage": 235,
      "cost": 141.00,
      "peakRate": 0.6,
      "peakCost": 84.60,
      "offPeakCost": 56.40
    },
    "water": {
      "usage": 24,
      "cost": 84.00,
      "breakdown": {
        "living": { "usage": 16.8, "cost": 58.80 },
        "shower": { "usage": 4.8, "cost": 16.80 },
        "kitchen": { "usage": 2.4, "cost": 8.40 }
      }
    },
    "gas": {
      "usage": 13.5,
      "cost": 37.80,
      "breakdown": {
        "heater": { "usage": 7.4, "cost": 20.79 },
        "stove": { "usage": 4.7, "cost": 13.16 },
        "boiler": { "usage": 1.4, "cost": 3.92 }
      }
    },
    "total": 262.80,
    "currency": "CNY"
  }
}
```

---

## 4. 健康监测

### 4.1 获取健康数据
获取用户健康指标数据。

**请求**
```
GET /health
```

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "user001",
    "name": "李小溪",
    "age": 29,
    "score": 92,
    "metrics": {
      "heartRate": { "value": 72, "unit": "bpm", "status": "normal" },
      "bloodPressure": { "sys": 118, "dia": 76, "unit": "mmHg", "status": "normal" },
      "bloodOxygen": { "value": 98, "unit": "%", "status": "normal" },
      "temperature": { "value": 36.5, "unit": "°C", "status": "normal" },
      "sleep": { "duration": 7.5, "unit": "h", "quality": "good" },
      "steps": { "value": 8500, "unit": "步", "goal": 10000 }
    },
    "devices": ["dev29", "dev30", "dev31"],
    "updatedAt": "2026-04-20T10:30:00Z"
  }
}
```

---

### 4.2 获取心率历史
```
GET /health/heart-rate?range=week
```

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "range": "week",
    "dataPoints": [
      { "timestamp": "2026-04-14T00:00:00Z", "value": 68 },
      { "timestamp": "2026-04-14T01:00:00Z", "value": 65 },
      { "timestamp": "2026-04-14T02:00:00Z", "value": 62 }
    ],
    "stats": {
      "min": 58,
      "max": 95,
      "avg": 72
    }
  }
}
```

---

## 5. 用户认证

### 5.1 用户登录
```
POST /auth/login
```

**请求体**
```json
{
  "username": "admin",
  "password": "xxxxxx"
}
```

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800,
    "user": {
      "id": "user001",
      "username": "admin",
      "name": "管理员",
      "role": "admin"
    }
  }
}
```

---

### 5.2 刷新 Token
```
POST /auth/refresh
```

**请求头**
```
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

---

### 5.3 用户登出
```
POST /auth/logout
```

**响应**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 6. WebSocket 实时推送

### 连接地址
```
wss://api.example.com/v1/ws?token=<token>
```

### 推送消息格式

**设备状态变更**
```json
{
  "type": "device_update",
  "data": {
    "id": "dev1",
    "status": true,
    "value": 26,
    "updatedAt": "2026-04-20T10:35:00Z"
  }
}
```

**环境数据更新**
```json
{
  "type": "environment_update",
  "data": {
    "temperature": 24.5,
    "humidity": 48,
    "updatedAt": "2026-04-20T10:30:00Z"
  }
}
```

**告警通知**
```json
{
  "type": "alert",
  "data": {
    "level": "warning",
    "title": "心率偏高提醒",
    "content": "检测到心率持续偏高，建议关注",
    "timestamp": "2026-04-20T10:30:00Z"
  }
}
```

---

## 7. 错误码

| code | 说明 | 处理建议 |
|------|------|---------|
| 1001 | Token 过期 | 重新登录 |
| 1002 | Token 无效 | 重新登录 |
| 2001 | 设备不在线 | 检查设备电源和网络 |
| 2002 | 设备控制失败 | 重试或检查设备状态 |
| 2003 | 设备不存在 | 检查设备 ID |
| 3001 | 传感器数据获取失败 | 检查传感器连接 |
| 4001 | 数据库错误 | 联系技术支持 |

---

## 8. 数据模型

### 设备 (Device)
```typescript
interface Device {
  id: string              // 设备唯一标识，如 "dev1"
  name: string            // 设备名称
  icon: string            // 图标 emoji
  room: string            // 所在房间
  vendor: string          // 厂商
  ip: string              // IP 地址
  protocol?: string       // 通信协议，如 "Wi-Fi", "Zigbee 3.0"
  firmware?: string       // 固件版本
  online: boolean         // 是否在线
  status: boolean        // 开关状态
  type: DeviceType        // 设备类型
  value: number          // 主数值（温度/亮度等）
  mode?: string           // 运行模式
  fanSpeed?: string       // 风速
  createdAt: string       // 创建时间 ISO 8601
  updatedAt: string       // 更新时间 ISO 8601
}

type DeviceType = 'ac' | 'light' | 'tv' | 'speaker' | 'outlet' | 'sensor' | 'security' | 'ventil' | 'washer' | 'heater'
```

### 能源数据 (EnergyStats)
```typescript
interface EnergyStats {
  electricity: {
    value: number    // 今日用电 kWh
    cost: number     // 费用 元
    trend: number    // 较昨日变化 %
  }
  water: {
    value: number    // 今日用水 m³
    cost: number     // 费用 元
    trend: number
  }
  gas: {
    value: number    // 今日用气 m³
    cost: number     // 费用 元
    trend: number
  }
  carbonReduction: number  // 碳减排 kg
  savingRate: number      // 节能率 %
}
```

---

## 9. 推荐技术方案

### 后端框架
- **Node.js + Express/Koa**：适合 IO 密集型应用
- **Python + FastAPI**：适合数据处理和 AI 集成
- **Go**：适合高并发场景

### 数据库
- **时序数据库**（InfluxDB/TimescaleDB）：存储能源、环境历史数据
- **关系型数据库**（PostgreSQL）：存储设备、用户数据
- **Redis**：缓存、实时数据、WebSocket 会话

### 消息队列
- **MQTT Broker**（如 EMQX）：设备通信协议
- **Redis Pub/Sub**：WebSocket 消息分发

### 部署架构
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   前端 Vue   │────▶│   API 网关   │────▶│  后端服务   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
             ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
             │   PostgreSQL│          │   InfluxDB  │          │    MQTT    │
             │  (设备/用户) │          │  (能源/环境) │          │  (设备通信) │
             └─────────────┘          └─────────────┘          └─────────────┘
```

### 设备接入协议建议
- **HTTP REST**：适合周期性上报的设备
- **MQTT**：适合实时控制的设备
- **WebSocket**：前端实时通信

---

*文档最后更新：2026-04-20*
