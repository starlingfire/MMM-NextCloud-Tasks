# MMM-NextCloud-Tasks

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/). Originally developed by [SoulofN00b](https://github.com/SoulOfNoob/MMM-NextCloud-Tasks/), I have forked it to resolve bugs and add new features.

This module loads a ToDo list via webDav from the NextCloud Tasks app using the "private link" and [NextCloud Managed Devices](https://docs.nextcloud.com/server/latest/user_manual/en/session_management.html#managing-devices)

Current development status: **released** \
![Small Screenshot](/assets/small_screenshot.png?raw=true)

## Dependencies

- Working NextCloud installation
- Installed Tasks app

## NextCloud preparations

1. Create a new app password in your Nextcloud installation at Settings > Security (under Personal) > Create New App Password
2. Give your app a name and generate the password: \
![App password screenshot](/assets/create-app-password.png?raw=true)
3. Create the Private Link to the ToDo list you want to display like this: \
![Tasks Screenshot](/assets/generate_private_link.png?raw=true)

## Installing the module

1. Navigate to your local `MagicMirror/modules` directory
2. run `git clone https://github.com/starlingfire/MMM-NextCloud-Tasks.git`
2. run `npm install` to install dependencies. (This could take several minutes because of the WebDav module)

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:

```js
var config = {
    modules: [
        {
            module: 'MMM-NextCloud-Tasks',
            config: {
                // See 'Configuration options' for more information.
                updateInterval: 60000,
                listUrl: "<NEXTCLOUD_TASKS_PRIVATE_LINK>",
                hideCompletedTasks: true,
                sortMethod: "<SORT_METHOD>",
                colorize: true,
                showCompletion: true,
                webDavAuth: {
                    username: "<NEXTCLOUD_APP_USERNAME>",
                    password: "<NEXTCLOUD_APP_PASSWORD>",
                }
            }
        }
    ]
}
```

## Configuration options

| Option               | Description
|----------------------|-----------
| `listUrl`            | *Required*: "Private Link" url from your desired NextCloud task-list
| `webDavAuth`         | *Required*: WebDav Authentication object consisting of username and password. <br> Example: `{username: "<NEXTCLOUD_APP_USERNAME>", password: "<NEXTCLOUD_APP_PASSWORD>",}`
| `updateInterval`     | *Optional*: How often should the data be refreshed (in milliseconds)
| `hideCompletedTasks` | *Optional*: should completed tasks show up or not
| `sortMethod`         | *Optional*: How to sort tasks. Options: "priority" "priority desc" "created" "created desc" "modified" "modified desc"
| `colorize`           | *Optional*: Should the icons be colorized based on priority?
| `showCompletion`     | *Optional*: Shows the percentage of completion

## Screenshots

Sorting on "priority" \
![Module Screenshot](/assets/small_screenshot.png?raw=true)

Sorting on "modified desc" \
![Module Screenshot 2](/assets/demo_screenshot_2.png?raw=true)

Non-colorized \
![Module Screenshot 2](/assets/demo_screenshot_3.png?raw=true)

