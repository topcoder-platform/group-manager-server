const requestIp = require('request-ip');
const db = require('./../models');

function dbLogger() {
    return (req, res, next) => {
        let hrstart = process.hrtime()   

        const cleanup = () => {
            res.removeListener('finish', finish)
            res.removeListener('close', close)
            res.removeListener('error', errorEvent)
        }

        const finish = () => {
            logRequest('finish');
        };
        const close = () => {
            logRequest('close');
        }
        const errorEvent = () => {
            logRequest('error');
        }
        
        res.on("close", close);
        res.on("error", errorEvent);
        res.on("finish", finish);
 
        const logRequest = serverEvent => {
            const {method, originalUrl, url, authUser } = req;
            const { statusCode } = res;

            // Dont audit for health check endpoints
            if (url == "/basicHealth" || url == "/health") {
                return;
            }

            let auditRecord = {
                http_method: method,
                url: originalUrl,
                status_code: statusCode,
                server_event: serverEvent,
                client_ip: requestIp.getClientIp(req)
            }
            if (authUser) {
                auditRecord.user_id = authUser.userId;
            }
            if (req.body) {
                auditRecord.request_body = JSON.stringify(req.body);
            }
            if (res.body) {
                auditRecord.response_body = JSON.stringify(res.body);   
            }

            auditRecord.response_time = extractMilliseconds(hrstart);    

            cleanup();


            db.Audit.create(auditRecord);
        }
        next();
    }
}

function extractMilliseconds(hrstart) {
    const diff = process.hrtime(hrstart);

    const nanoseconds = (diff[0] * 1e9) + diff[1];
	const milliseconds = nanoseconds / 1e6;

    return milliseconds

}


module.exports = dbLogger;