sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(BaseController) {
	"use strict";

	return BaseController.extend("zui5_orders.controller.Launchpad", {

		// Se inicia la aplicación y llamamos a la función de carga de TILES
		onInit: function() {
			this.buildLaunchpad();
		},
		// Llama a todas las funciones que arman grupos del launchpad

		buildLaunchpad: function() {

			var oLaunchpad = this.getView().byId("contentLaunch");

			this.addWebNoticesTileGroup(oLaunchpad);

		},

		// Funcion para la creación de TILES del custom launchpad

		createTile: function(sTitle, sDisplay, sIcon, sIdPant, iNumero) {
			var that, sVisible, oTile;

			that = this;

			sVisible = sDisplay;

			// Lo que no sea una string o bool, sera tratado como bool.
			if ((typeof sVisible !== "string") && (typeof sVisible !== "boolean")) {
				sVisible = false;
			}

			oTile = new sap.m.GenericTile({
				header: sTitle,
				visible: sVisible,
				tileContent: new sap.m.TileContent({
					content: new sap.m.NumericContent({
						icon: sIcon,
						value: iNumero,
						nullifyValue: false
					})
				}),
				press: function() {
					that.onPressTile(sIdPant);
				}
			}).addStyleClass("tiles1");

			return oTile;
		},

		// Adicionamos un grupo 

		addWebNoticesTileGroup: function(oLaunchpad) {
			var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			var oPanel = new sap.m.Panel({
				headerText: oBundle.getText("noticesTitleGroup")
			});

			oPanel.addContent(this.createTile(oBundle.getText("webnoticesGroup"),
				true, // TODO obtener datos de usuario para mostrar tile {userInfo>/Rols/DisplayNO}
				"sap-icon://bell",
				"notices",
				"5")); // TODO llamar servicio para obtener número de alertas {indicadoresNum>/avisos}

			oPanel.addContent(this.createTile(oBundle.getText("transOrder"),
				true, // TODO obtener datos de usuario para mostrar tile {userInfo>/Rols/DisplayNO}
				"sap-icon://shipping-status",
				"transfer",
				"{indicadoresNum>/avisos}"));

			oLaunchpad.addContent(oPanel.addStyleClass("panelCusto"));
		},

		onPressTile: function(sIdPant) {
			this.getOwnerComponent().getRouter().navTo(sIdPant, {}, true);
			/*	var oData, oContainerView, oContainerController, oBundle;

				oBundle = this.getResourceBundle();

				if (!this.getModel("userInfo").getProperty("/Werks")) {
					// If no store is selected, a error is show.
					this.showMessageCustomBox({
						title: oBundle.getText("noStoreTitleGenericError"),
						message: oBundle.getText("noStoreDeatailGenericError"),
						type: sap.ui.core.MessageType.Error
					});
					return;
				}

				oData = {};
				oData.newHash = sIdPant;

				// Miramos si existe la vista del ComponentContainer, y si existe, cogemos el controllador. Sí
				// el controlador también existe (Se ha creado ya la vista), habilitamos el evento Display para
				// poder abirir la casilla seleccionada.

				this.getRouter().getTargets().display("componentContainer", oData, "launchpad");

				oContainerView = this.getRouter().getView("zui5_launchpad.view.ComponentContainer", "XML");

				if (oContainerView) {

					oContainerController = oContainerView.getController();

					if (oContainerController) {
						this.getRouter().getTargets().attachDisplay(oContainerController._handleTargetDisplay, oContainerController);
					}
				}*/
		}

	});

});