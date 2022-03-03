sap.ui.define([], function() {
	"use strict";

	return {

		storeName: function(pWerks, pName, pDefault) {
			var oBundle, text;

			if (pWerks) {
				oBundle = this.getResourceBundle();

				if (pWerks && pName && pDefault) {
					text = oBundle.getText("storeDefaultText", [pWerks, pName]);
				} else if (pWerks && pName) {
					text = oBundle.getText("storeNonDefaultText", [pWerks, pName]);
				} else {
					text = oBundle.getText("storeNonNametext", pWerks);
				}
			}

			return text;
		},

		formatDate: function(pDate, pInternalFormat) {
			var day, month, year, result;

			if (pDate) {
				day = pDate.getDate();
				month = pDate.getMonth() + 1;
				year = pDate.getFullYear();

				result = day + "/" + month + "/" + year;
			}

			return result;
		},

		formatTime: function(time) {
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: "HH:mm:ss"
			});
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
			var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs));
			return timeStr;
		},

		storeLength: function(pList) {
			var enable;

			if (pList && (pList.length > 1)) {
				enable = true;
			} else {
				enable = false;
			}

			return enable;
		},

		displayLoginEnvironment: function() {
			debugger;
			var bResult, oBundle;

			bResult = false;

			if (this.isTablet() || this.isPhone()) {
				oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

				if (oBundle.getText("isTest") === "false") {
					bResult = true;
				}
			}

			return bResult;
		}
	};
});