const USERNAME = 'SACC';
const PASSWORD = 'PWD';
const API_KEY = 'API';
const API_URL = 'https://letmegoogleitforyou/api/v2/group';
const authHeader = `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`;

const mappings = [
    { prefix: '11', parentId: 'targetgrupid' },
    { prefix: '12', parentId: 'targetgrupid' },
    { prefix: '13', parentId: 'targetgrupid' },
    { prefix: '14', parentId: 'targetgrupid' },
    { prefix: '15', parentId: 'targetgrupid' },
    { prefix: '16', parentId: 'targetgrupid' },
    { prefix: '4', parentId: 'targetgrupid' },
    { prefix: '5', parentId: 'targetgrupid' },
    { prefix: '6', parentId: 'targetgrupid' },
    { prefix: '7', parentId: 'targetgrupid' },
    { prefix: '8', parentId: 'targetgrupid' },
    { prefix: '2', parentId: 'targetgrupid' },
];

function getParentId(code) {
    for (let { prefix, parentId } of mappings) {
        if (code.startsWith(prefix)) return parentId;
    }
    return null;
}

async function createGroup(parentId, name) {
    const payload = { GroupName: name, GroupID: parentId };
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'ApiKey': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`API ${res.status}: ${text}`);
    return JSON.parse(text);
}

(async () => {
    const [, , code, ...nameParts] = process.argv;

    if (!code || !/^\d{4}$/.test(code)) {
        console.error('Usage: node createGroup.js <4-digit-code> <GroupName>');
        process.exit(1);
    }
    const restName = nameParts.join(' ').trim();
    if (!restName) {
        console.error('Error: missing group name after the code.');
        process.exit(1);
    }
    const groupName = `${code} - ${restName}`;

    const parentId = getParentId(code);
    if (!parentId) {
        console.error(`Error: no mapping found for code prefix “${code.slice(0, 2)}”`);
        process.exit(1);
    }
    try {
        console.log(`Creating group “${groupName}” under parent ${parentId}…`);
        const result = await createGroup(parentId, groupName);
        console.log('Success:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Failed to create group:', err.message);
        process.exit(1);
    }
})();
