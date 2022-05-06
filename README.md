# sqowey_server

## Configuration example
```
{
    "mail":{
        "host": "smtp.gmail.com",
        "port": 465,
        "secure": true,
        "auth": {
            "user": "USERNAME@gmail.com",
            "pass": "PASSWORD"
        }
    },
    "db_tables":{
        "twofactor_mails": {
            "host": "localhost",
            "port": 3306,
            "user": "root",
            "pass": "",
            "db": "sqowey_mails"
            "table": "twofactor"
        }
    }
}
```