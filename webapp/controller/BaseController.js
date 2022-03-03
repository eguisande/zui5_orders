sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"zui5_orders/model/models",
	"sap/m/MessageBox",
	"zui5_orders/utils/formatter",
	"sap/ui/core/routing/History"
], function(Controller, model, MessageBox, formatter, History) {
	"use strict";

	return Controller.extend("BaseController", {

		onInit: function() {
            debugger;
		},

		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},
		

		isTablet: function() {
			var oModel = this.getView().getModel("device") || this.getOwnerComponent().getModel("device");

			if (oModel) {
				return oModel.getData().system.tablet;
			} else {
				return false;
			}
		},

		isPhone: function() {
			var oModel = this.getView().getModel("device") || this.getOwnerComponent().getModel("device");

			if (oModel) {
				return oModel.getData().system.phone;
			} else {
				return false;
			}
		},

		onNavBack: function() {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("launchpad", {}, true /*no history*/ );
			}
		},
		
			getId: function (pParam) {
			return this.getView().byId(pParam) || this.getOwnerComponent().byId(pParam);
		},


		getComponent: function () {
			var componentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			return sap.ui.component(componentId);
		},

		getModel: function (sName) {
			return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		showMessageCustomBox: function (pProperties) {
			var title, icon, actions, oResources;

			if (typeof pProperties !== "object") {
				return;
			}

			oResources = this.getResourceBundle();

			switch (pProperties.type) {
			case sap.ui.core.MessageType.Error:
				icon = MessageBox.Icon.ERROR;
				title = oResources.getText("MessageTypeError");
				break;

			case sap.ui.core.MessageType.Information:
				icon = MessageBox.Icon.INFORMATION;
				title = oResources.getText("MessageTypeInformation");
				break;

			case sap.ui.core.MessageType.None:
				icon = MessageBox.Icon.NONE;
				title = oResources.getText("MessageTypeNone");
				break;

			case sap.ui.core.MessageType.Success:
				icon = MessageBox.Icon.SUCCESS;
				title = oResources.getText("MessageTypeSuccess");
				break;

			case sap.ui.core.MessageType.Warning:
				icon = MessageBox.Icon.WARNING;
				title = oResources.getText("MessageTypeWarning");
				break;

			default:
				icon = MessageBox.Icon.QUESTION;
				title = oResources.getText("MessageTypeQuestion");
				break;
			}

			icon = pProperties.icon || icon;
			title = pProperties.title || title;
			actions = pProperties.actions || sap.m.MessageBox.Action.OK;
			pProperties.details = pProperties.details;

			sap.m.MessageBox.show(pProperties.message, {
				icon: icon,
				title: title,
				actions: actions,
				styleClass: pProperties.styleClass,
				details: pProperties.details,
				onClose: pProperties.close,
				initialFocus: pProperties.focus
			});
		},

		parseRequestError: function (pError) {
			var text, error, message, details;

			if (typeof pError === "object") {
				text = pError.responseText;
			} else if (typeof pError === "string") {
				text = pError;
			} else {
				return;
			}

			if (this._isJSON(text)) {
				error = JSON.parse(text);

				message = error.error.message.value;
			} else if (this._isHTML(text)) {
				error = this._parseHTML(text);

				message = error.message;
				details = error.details;
			} else {
				details = text;
			}

			return {
				message: message,
				details: details
			};
		},

		_isJSON: function (pStr) {
			try {
				JSON.parse(pStr);
			} catch (e) {
				return false;
			}

			return true;
		},

		_setFilter: function (pFilterTable, pKey, pValue1, pValue2, pOperator) {
			pOperator = pOperator || sap.ui.model.FilterOperator.EQ;

			var filter = new sap.ui.model.Filter({
				path: pKey,
				operator: pOperator,
				value1: pValue1,
				value2: pValue2
			});

			pFilterTable.push(filter);
		},

		_isHTML: function (pStr) {
			var isHTML = RegExp.prototype.test.bind(/(<([^>]+)>)/i);

			return isHTML(pStr);
		},

		_parseHTML: function (pStr) {
			var oParser = new DOMParser();
			var htmlDoc = oParser.parseFromString(pStr, "text/html");

			return {
				message: htmlDoc.getElementsByTagName("title")[0].text,
				details: htmlDoc.getElementsByTagName("h1")[0].textContent
			};
		},


		_getServiceURL: function (pUrl) {
			var sServiceUrlText;

			sServiceUrlText = this.getResourceBundle().getText("con");

			if (sServiceUrlText === "con") {
				sServiceUrlText = "";
			}

			return sServiceUrlText + pUrl;
		},

		_getExternalAppsURL: function (pUrl) {
			// FGarcia - 28.10.2020 - INI - Se cambia el código para la migración al servidor de GW.
			/*var sServiceUrlText = this.getResourceBundle().getText("con");

			if (sServiceUrlText === "") {
				sServiceUrlText = window.location.origin;
			}*/

			var oBundle, sServiceUrlText;

			oBundle = this.getResourceBundle();

			if (this.isProductive()) {
				sServiceUrlText = oBundle.getText("externalUrlERP");
			} else {
				sServiceUrlText = oBundle.getText("externalUrlERD");
			}
			// FGarcia - 28.10.2020

			return sServiceUrlText + pUrl;
		},

		getWerks: function () {
			var oModel = this.getModel("userInfo");

			if (oModel) {
				return oModel.getProperty("/Werks");
			} else {
				return "T001";
			}
		},

		getClient: function () {
			return this.getResourceBundle().getText("sap-client");
		},

		getLanguage: function () {
			return sap.ui.getCore().getConfiguration().getLanguage().split("-")[1];
		},

		isProductive: function () {
			var bIsProductive, oModel;

			bIsProductive = false;

			oModel = this.getModel("userInfo");

			if (oModel) {
				bIsProductive = oModel.getProperty("/SystemInfo/IsProductive") || false;
			}

			return bIsProductive;
		}
	});
});