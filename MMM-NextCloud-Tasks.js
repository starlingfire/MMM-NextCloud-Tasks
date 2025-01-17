/* global Module */

/* Magic Mirror
 * Module: MMM-NextCloud-Tasks
 *
 * By Jan Ryklikas
 * MIT Licensed.
 */

Module.register("MMM-NextCloud-Tasks", {
	defaults: {
		updateInterval: 60000,
		hideCompletedTasks: true,
		sortMethod: "priority",
		colorize: false,
		startsInDays: 999999,
		displayStartDate: true,
		dueInDays: 999999,
		displayDueDate: true,
		showWithoutStart: true,
        showWithoutDue: true,
		dateFormat: "DD.MM.YYYY",
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	toDoList: null,
	error: null,

	start: function () {
		var self = this;

		//Flag for check if module is loaded
		self.loaded = false;

		if (self.verifyConfig(self.config)) {
            if (self.isListUrlSingleValue(self.config.listUrl)) {
                self.error = "Config Error: 'listUrl' should be an array now as the module now supports multiple urls. Example:\n" +
                             "Old: listUrl: 'https://my-nextcloud.com/remote.php/dav/calendars/cornelius/private-tasks/'\n" +
                             "New: listUrl: ['https://my-nextcloud.com/remote.php/dav/calendars/cornelius/private-tasks/']";
                self.updateDom();
                return;
            }

            // Schedule update timer.
            self.getData();
            setInterval(function() {
                self.getData();
                self.updateDom();
            }, self.config.updateInterval);
        } else {
            Log.info("config invalid");
            self.error = "config invalid";
            self.updateDom();
        }
    },

    isListUrlSingleValue: function(listUrl) {
        return typeof listUrl === "string";
    },


		if(self.verifyConfig(self.config)) {
			// Schedule update timer.
			self.getData();
			setInterval(function() {
				self.getData();
				self.updateDom();
			}, self.config.updateInterval);
		} else {
			Log.info("config invalid");
			self.error = "config invalid";
			self.updateDom();
		}
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function () {
		this.sendSocketNotification(
			"MMM-NextCloud-Tasks-UPDATE",
			{
				id: this.identifier,
				config: this.config
			}
		);
	},

	getDom: function () {
		let self = this;

		// create element wrapper for show into the module
		let wrapper = document.createElement("div");
		wrapper.className = "MMM-NextCloud-Tasks-wrapper";

		if (self.toDoList) {
			wrapper.appendChild(self.renderList(self.toDoList));
			self.error = null;
		} else {
			wrapper.innerHTML= "<div>Loading...</div>";
		}

		if (self.error) {
			wrapper.innerHTML= "<div>" + self.error + "</div>";
		}
		
		// Initialize long press handlers after the DOM is updated
		this.initLongPressHandlers();
		return wrapper;
	},

	// create list of tasks
	renderList: function (children) {
		let self = this;

		let red = "<span style=\"color:#e3516e\">"
		let yellow = "<span style=\"color:#e1e34f\">"
		let blue = "<span style=\"color:#2f26f4\">"
		let grey = "<span style=\"color:#646464\">"
		let endSpan = "</span>"
		let checked = "<span class=\"fa fa-fw fa-check-square\"></span>"
		let unchecked = "<span class=\"fa fa-fw fa-square\"></span>"

		let ul = document.createElement("ul");
		for (const element of children) {
			let p = element.priority;
			if (element.status !== "COMPLETED" || self.config.hideCompletedTasks === false) {
				const now = new Date();

				if (element.start) {
					const start = new Date(element.start);
					const daysUntilStart = (start - now) / (1000 * 60 * 60 * 24);
					if (daysUntilStart > self.config.startsInDays) {
						continue;
					}
				} else if (!self.config.showWithoutStart) {
					continue;
				}

				if (element.end) {
					const end = new Date(element.end);
					const daysUntilDue = (end - now) / (1000 * 60 * 60 * 24);
					if (daysUntilDue > self.config.dueInDays) {
						continue;
					}
				} else if (!self.config.showWithoutDue) {
					continue;
				}

				let icon = (element.status === "COMPLETED" ? checked : unchecked );
				let li = document.createElement("li");
				li.id = element.uid;
				let color = (p < 5 ? red : (p == 5 ? yellow : (p <= 9 ? blue : grey)));

				// create the list item either with or without color
				if (self.config.colorize) {
					li.innerHTML = "<div class='MMM-NextCloud-Task-List-Item'>" + color + icon + endSpan + " " + element.summary + "</div>";
				} else {
					li.innerHTML = "<div class='MMM-NextCloud-Task-List-Item'>" + icon + " " + element.summary + "</div>";
				}

				// add start and due date if available
				if (self.config.displayStartDate && element.start) {
					let spanStart = document.createElement("span");
					spanStart.className = "MMM-NextCloud-Tasks-StartDate";
					spanStart.textContent = " " + moment(element.start).format(self.config.dateFormat);
					li.appendChild(spanStart);
				}
				if (self.config.displayDueDate && element.due) {
					let spanDue = document.createElement("span");
					spanDue.className = "MMM-NextCloud-Tasks-DueDate";
					spanDue.textContent = " " + moment(element.due).format(self.config.dateFormat);
					li.appendChild(spanDue);
				}

				if (typeof element.children !== "undefined") {
					let childList = self.renderList(element.children);
					li.appendChild(childList);
				}
				ul.appendChild(li);
			}
		}
		return ul;
	},

	// Animate list element when long clicking
	initLongPressHandlers: function() {
		const items = document.querySelectorAll(".MMM-NextCloud-Tasks-wrapper li");
		items.forEach((item) => {
			let pressTimer = null;
			let startTime = 0;
			const duration = 3000; // 3 seconds
			let blurInterval = null;

			const resetEffects = () => {
				clearTimeout(pressTimer);
				clearInterval(blurInterval);
				item.style.filter = "none";
				item.style.opacity = "1";
			};

			const startEffects = () => {
				startTime = Date.now();
				const effectSpeed = duration / 50; // Use a fraction of the duration variable
				blurInterval = setInterval(() => {
					const elapsed = Date.now() - startTime;
					if (elapsed >= duration) {
						clearInterval(blurInterval);
						toggleCheck(item);
					} else {
						const progress = elapsed / duration;
						item.style.filter = `blur(${4 * progress}px)`;
						item.style.opacity = `${1 - progress}`;
					}
				}, effectSpeed);
			};

			const toggleCheck = (listItem) => {
				const iconSpan = listItem.querySelector(".fa");
				if (!iconSpan) return;
				const isChecked = iconSpan.classList.contains("fa-check-square");
				iconSpan.classList.toggle("fa-check-square", !isChecked);
				iconSpan.classList.toggle("fa-square", isChecked);
				const newState = isChecked ? "unchecked" : "checked";
				toggleTaskStatus(newState, listItem.id); // call into webDavHelper.js
				resetEffects();
			};

			item.addEventListener("mousedown", () => {
				resetEffects();
				pressTimer = setTimeout(() => {}, duration);
				startEffects();
			});
			item.addEventListener("mouseup", resetEffects);
			item.addEventListener("mouseleave", resetEffects);
		});
	},

	getStyles: function () {
		return [
			"MMM-NextCloud-Tasks.css",
		];
	},

	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-NextCloud-Tasks-Helper-TODOS#" + this.identifier) {
			this.toDoList = payload;
			this.updateDom();
		}
		if(notification === "MMM-NextCloud-Tasks-Helper-LOG#" + this.identifier) {
			Log.log("LOG: ", payload);
		}
		if(notification === "MMM-NextCloud-Tasks-Helper-ERROR#" + this.identifier) {
			Log.error("ERROR: ", payload);
			this.error = payload + "<br>";
			this.updateDom();
		}
	},

	verifyConfig: function (config) {
		if(
			typeof config.listUrl === "undefined" ||
			typeof config.webDavAuth === "undefined" ||
			typeof config.webDavAuth.username === "undefined" ||
			typeof config.webDavAuth.password === "undefined" ||
			typeof config.sortMethod === "undefined" ||
			typeof config.colorize === "undefined"
		) {
			this.error = "Config variable missing";
			Log.error("Config variable missing");
			return false;
		}
		return true;
	}
});