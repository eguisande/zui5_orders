sap.ui.define([
	"zui5_orders/controller/BaseController",
	"zui5_orders/model/models"
], function(BaseController, models) {
	"use strict";

	return BaseController.extend("zui5_orders.controller.Login", {
		onInit: function() {
			BaseController.prototype.onInit.call(this);

			this.setModel(models.createLoginModel(), "login");
			this.onLoginCache();
			var oLoginModel = this.getModel("login");
			oLoginModel.setProperty("/user", "");
			oLoginModel.setProperty("/pass", "");
		},

		onLoginCache: function () {
			var user, pass, oLoginModel;
			oLoginModel = this.getModel("login");
			user = "doNotPass";
			pass = "doNotPass";
			this.onLog(oLoginModel, user, pass, "X");
		},
		
		onLogin: function() {
			var user, pass, oLoginModel;
			oLoginModel = this.getModel("login");
			pass = this.getView().byId("passInput").getValue();
			user = this.getView().byId("userInput").getValue();
			if (this.checkFields(user, "userInput") && this.checkFields(pass, "passInput")) {
				this.onLog(oLoginModel, user, pass, "");
			}
		},

		onLog: function(oLoginModel, user, pass, mode) {
			var that = this;
			var oLoginBox = this.getId("loginBox");
			oLoginBox.setBusy(true);

			var serviceUrlText = this._getServiceURL("/sap/opu/odata/sap/ZUI5_BS_LAUNCHPAD_SRV/");

			var model = new sap.ui.model.odata.v2.ODataModel(
				serviceUrlText, {
					useBatch: true,
					user: user,
					password: pass
						//tokenHandling: true
				});

			var onMetadataLoadFinished = function(pSuccess, oEvent) {
				if (!pSuccess) {
					if (mode === "X") {
						oLoginBox.setBusy(false);
						return;
					}

					// Disable busy state.
					oLoginBox.setBusy(false);

					var oParsedError = that.parseRequestError(oEvent.getParameter("responseText"));
					// Show error.
					if (oParsedError) {
						that.showMessageCustomBox({
							message: oParsedError.message,
							details: oParsedError.details,
							type: sap.ui.core.MessageType.Error
						});
					}
					return;
				}

				var data = {
					Stores: []
				};

				/*  if (oEvent.mParameters.metadata.mEntityTypes.UserInfoSet == undefined){
				   oLoginBox.setBusy(false);
				   return;
				  }*/

				model.create("/UserInfoSet", data, {
					success: function onSuccess(oData, oResponse) {

						//jQuery.sap.storage(jQuery.sap.storage.Type.local).put("Offline", "");
						var oWerks, oUserInfoModel;
						// Get User Info model.
						oUserInfoModel = that.getModel("userInfo");
						// Clean Login and User Info models.
						oLoginModel.setData({});
						oUserInfoModel.setData({});
						// Set type of user.
						oUserInfoModel.setProperty("/userName", user);
						oUserInfoModel.setProperty("/userPass", pass);
						oUserInfoModel.setProperty("/Rols", oData.Rols);
						oUserInfoModel.setProperty("/SystemInfo", oData.SystemInfo);

						// Set stores' list.
						if (oData.Stores && oData.Stores.results) {
							oUserInfoModel.setProperty("/WerksList", oData.Stores.results);
							if (oData.Stores.results.length >= 0) {
								for (var i = 0; i < oData.Stores.results.length; i++) {
									if (oData.Stores.results[i].Default === true) {
										oWerks = oData.Stores.results[i];
									}
								}
								// Set user default store as launchpad's default store.
								oUserInfoModel.setProperty("/Werks", oWerks.Werks);
							}
						}

						// Initialize the router and nav to launchpad.
						that.getRouter().initialize();
						that.getRouter().navTo("launchpad", null, true);
						// Disable busy state.
						oLoginBox.setBusy(false);
						that.setModel(null, "oDataAppModel");
					},
					error: function onError(oError) {
						oLoginBox.setBusy(false);
						if (mode === "X") {

							return;
						}

						var oBundle;
						// Get resources (Texts).
						oBundle = that.getResourceBundle();
						// Parse JSON message error.
						oParsedError = that.parseRequestError(oError);
						// Show error.
						that.showMessageCustomBox({
							message: oParsedError.message || oBundle.getText("loginGenericError"),
							details: oParsedError.details,
							type: sap.ui.core.MessageType.Error
						});
					}
				});
			};

			model.attachMetadataLoaded(onMetadataLoadFinished.bind(this, true));
			model.attachMetadataFailed(onMetadataLoadFinished.bind(this, false));
			this.setModel(model, "oDataAppModel");
		},
		
		checkFields: function (pField, pId) {
			var valueStateText, oResourceBundle;
			//Si el campo esta infromado, devolvemos true. Sino está informado, miramos
			// que se haya infromado el ID de la vista.
			if (!pField) {
				if (pId) {
					oResourceBundle = this.getResourceBundle();
					//En caso de que se haya informado un ID, cogemos el texto asociado al
					// estado que se le debe poner.
					valueStateText = oResourceBundle.getText("checkFieldsEmpty");
					this.setInputState(pId, sap.ui.core.ValueState.Error, valueStateText);
				}
				return false;
			} else {
				return true;
			}
		},

		onClearFieldState: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
		},

		onUserInputSubmit: function (oEvent) {
			var input = this.getView().byId("passInput");
			if (input) {
				input.focus();
			}
		},

		onPassInputSubmit: function (oEvent) {
			var input = this.getView().byId("loginButton");

			if (input) {
				input.focus();
			}
		},

		setInputState: function (pId, pState, pStateText) {
			var input = this.getView().byId(pId);
			if (!input) {
				return;
			}
			if (pState) {
				input.setValueState(pState);
			}
			if (pStateText) {
				input.setValueStateText(pStateText);
			}
			input.focus();
		}

	});

});