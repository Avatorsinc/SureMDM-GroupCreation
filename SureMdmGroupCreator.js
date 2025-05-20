var SureMdmGroupCreator = Class.create();
SureMdmGroupCreator.prototype = {
    initialize: function () { },

    /**
     * @param {String} cstCode
     * @param {String} displayName
     * @return {Object}
     * @throws
     */
    createGroup: function (cstCode, displayName) {
        if (!/^\d{4}$/.test(cstCode))
            throw 'CST code must be exactly 4 digits';
        var groupName = cstCode + ' - ' + displayName;
        var mappings = {
            '11': 'targetgrupid',
            '12': 'targetgrupid',
            '13': 'targetgrupid',
            '14': 'targetgrupid',
            '15': 'targetgrupid',
            '16': 'targetgrupid',
            '4': 'targetgrupid',
            '5': 'targetgrupid',
            '6': 'targetgrupid',
            '7': 'targetgrupid',
            '8': 'targetgrupid',
            '2': 'targetgrupid'
        };
        var key = cstCode.charAt(0) === '1' ? cstCode.substring(0, 2) : cstCode.charAt(0);
        var parentId = mappings[key];
        if (!parentId)
            throw 'No parent mapping found for CST prefix "' + key + '"';
        var rm = new sn_ws.RESTMessageV2();
        rm.setHttpMethod('post');

        //replace these!
        rm.setEndpoint('https://suremdm.42gears.com/api/v2/group');
        rm.setHttpBasicAuth('SACC', 'PWD');
        rm.setRequestHeader('ApiKey', 'API');
        // abovve.
        rm.setRequestHeader('Content-Type', 'application/json');
        rm.setRequestBody(JSON.stringify({
            GroupName: groupName,
            GroupID: parentId
        }));

        var response = rm.execute();
        var code = response.getStatusCode();
        var body = response.getBody();
        if (code < 200 || code >= 300)
            throw 'SureMDM API error: ' + code + ' – ' + body;

        return JSON.parse(body);
    },

    type: 'SureMdmGroupCreator'
};
