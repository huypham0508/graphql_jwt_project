import { createClient } from 'redis';

const STATUS_REDIS_CONNECT = {
    "CONNECT": "connect",
    "END": "end",
    "RE_CONNECT": "reconnect",
    "ERROR": "error",
}, REDIS_CONNECT_TIMEOUT = 10000;

let client: { instanceRedis: any } = { instanceRedis: undefined }, connection_timeout: any;


const handleConnect = (instance: any) => {
    instance.on(STATUS_REDIS_CONNECT.CONNECT, () => {
        console.log("REDIS - connected successfully!");
        clearTimeout(connection_timeout);
    })
    instance.on(STATUS_REDIS_CONNECT.RE_CONNECT, () => {
        clearTimeout(connection_timeout);
        console.log("REDIS - trying connect to redis!");
    })
    instance.on(STATUS_REDIS_CONNECT.END, () => {
        console.log("REDIS - ended!");
        handleTimeoutError();
    })
    instance.on(STATUS_REDIS_CONNECT.ERROR, (err: any) => {
        console.log("REDIS - error!", err);
        handleTimeoutError();
    })
}

const handleTimeoutError = () => {
    connection_timeout = setTimeout(() => {
        throw new Error("REDIS - Connection timeout")
    }, REDIS_CONNECT_TIMEOUT)
}

const initRedis = async () => {
    const instanceRedis = createClient(
        {
            username: 'admin',
            password: 'Huy@11072002',
            socket: {
                host: 'redis-19865.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com',
                port: 19865
            }
        }
    );
    client.instanceRedis = instanceRedis;
    instanceRedis.connect();
    handleConnect(instanceRedis);
}

const getRedis = () => client
const closeRedis = () => {}

export { initRedis, getRedis, closeRedis }