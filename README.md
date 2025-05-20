# SureMDM Group Creation Script

This repository provides **two** ready-to-use solutions for automating SureMDM group creation based on a 4‑digit CST code and a descriptive name:

1. **Node.js CLI** – a local command‑line tool you run with Node.js.
2. **ServiceNow Integration** – a Script Include plus a Flow Designer Action to trigger from a Service Catalog item.

---

## Table of Contents

* [Node.js CLI](#nodejs-cli)

  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Configuration](#configuration)
  * [Usage](#usage)
  * [Mapping Table](#mapping-table)
* [ServiceNow Integration](#servicenow-integration)

  * [Script Include](#script-include)
  * [Flow Designer Action](#flow-designer-action)
* [License](#license)

---

## Node.js CLI

A simple Node.js script (`app.js`) that:

* Validates a 4‑digit CST code (`XXXX`).
* Prefixes it to the group name as `XXXX - Group Name`.
* Maps the code prefix to the correct parent group ID.
* Sends a POST to the SureMDM API (`/api/v2/group`).

### Prerequisites

* **Node.js** v18 or newer (v22+ recommended for built‑in `fetch`)
* A SureMDM account (Username, Password) and an API Key

### Installation

```bash
git clone https://github.com/Avatorsinc/SureMDM-GroupCreation.git
cd SureMDM-GroupCreation
npm install        # (if you have a package.json)
```

If your Node.js < v18, install a fetch polyfill:

```bash
npm install node-fetch
```

### Configuration

Open **app.js** and update:

```js
const USERNAME = 'name@something.com';
const PASSWORD = 'Password';
const API_KEY  = 'Api';
const API_URL  = 'https://consoleurl/api/v2/group';
```

If you installed `node-fetch`, add at the top:

```js
import fetch from 'node-fetch';  // ES modules
// or
// const fetch = require('node-fetch');  // CommonJS
```

And in your `package.json`:

```json
{ "type": "module" }  // if using ES imports
```

### Usage

```bash
node app.js <4-digit-code> "<Group Name>"
```

* `<4-digit-code>`: exactly four digits (e.g. `2100`).
* `<Group Name>`: free‑form text (e.g. `Test BR`).

The script creates `GroupName: "2100 - Test BR"` under the mapped parent.

#### Example

```bash
node app.js 2100 "Test BR"
```

### Mapping Table

| CST Prefix | Parent Group ID                        |
| ---------- | -------------------------------------- |
| `11XX`     | `targetgrupid` |
| `12XX`     | `targetgrupid` |
| `13XX`     | `targetgrupid` |
| `14XX`     | `targetgrupid` |
| `15XX`     | `targetgrupid` |
| `16XX`     | `targetgrupid` |
| `4XXX`     | `targetgrupid` |
| `5XXX`     | `targetgrupid` |
| `6XXX`     | `targetgrupid` |
| `7XXX`     | `targetgrupid` |
| `8XXX`     | `targetgrupid` |
| `2XXX`     | `targetgrupid` |

---

## ServiceNow Integration

Embed the same logic into ServiceNow using a **Script Include** and a **Flow Designer Action**.

### Script Include

Create a new Script Include named `SureMdmGroupCreator` (Client Callable = false):

```javascript
var SureMdmGroupCreator = Class.create();
SureMdmGroupCreator.prototype = {
  initialize: function() {},

  /**
   * @param {String} cstCode 4-digit code ("2100")
   * @param {String} displayName descriptive name ("Test BR")
   * @returns {Object} parsed API response
   */
  createGroup: function(cstCode, displayName) {
    if (!/^[0-9]{4}$/.test(cstCode))
      throw 'CST code must be exactly 4 digits';
    var groupName = cstCode + ' - ' + displayName;

    var mappings = {
      '11': 'targetgrupid',
      '12': 'targetgrupid',
      '13': 'targetgrupid',
      '14': 'targetgrupid',
      '15': 'targetgrupid',
      '16': 'targetgrupid',
      '4':  'targetgrupid',
      '5':  'targetgrupid',
      '6':  'targetgrupidb',
      '7':  'targetgrupid',
      '8':  'targetgrupid',
      '2':  'targetgrupid'
    };
    var key = cstCode.charAt(0) === '1' ? cstCode.substring(0,2) : cstCode.charAt(0);
    var parentId = mappings[key];
    if (!parentId)
      throw 'No parent mapping for prefix ' + key;

    var rm = new sn_ws.RESTMessageV2();
    rm.setHttpMethod('post');
    rm.setEndpoint('https://consoleurl/api/v2/group');
    rm.setHttpBasicAuth('name@something.com','PASSWORD');
    rm.setRequestHeader('ApiKey','API');
    rm.setRequestHeader('Content-Type','application/json');
    rm.setRequestBody(JSON.stringify({ GroupName: groupName, GroupID: parentId }));

    var resp = rm.execute();
    var code = resp.getStatusCode(), body = resp.getBody();
    if (code < 200 || code >= 300)
      throw 'SureMDM API error: ' + code + ' - ' + body;
    return JSON.parse(body);
  },
  type: 'SureMdmGroupCreator'
};
```

> **Tip:** store credentials in a ServiceNow Credential record and use `rm.setHttpCredential()` instead of inline auth.

### Flow Designer Action

1. **Create Action** in Flow Designer ➔ **Create SureMDM Group**
2. **Inputs**:
   (cst_code == XXXX)
   * `cst_code` *(String)*
   * `display_name` *(String)*
3. **Outputs**:

   * `response` *(JSON)*
4. **Steps**:

   * Add a **Script** step:

     ```javascript
     (function execute(inputs, outputs) {
       var creator = new SureMdmGroupCreator();
       outputs.response = creator.createGroup(inputs.cst_code, inputs.display_name);
     })(inputs, outputs);
     ```
5. **Use** it in your Catalog‐Triggered Flow by mapping catalog variables to `cst_code` and `display_name`.

---

## License

MIT © \[Your Name]
