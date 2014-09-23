/*global define */
/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
define(
     ({
        "map": {
            "error": "Impossible de créer la carte"
        },
        "tools":{
            "search":{
                "error": "Emplacement introuvable",
                "notWhatYouWanted": "Ce n\'est pas ce que vous vouliez ?",
                "selectAnother": "Sélectionnez un autre emplacement",
                "currentLocation": "Emplacement actuel",
                "title": "Emplacement"
            },
	    	"print": {
			    "layouts":{
			      "label1": 'Paysage',
			      "label2": 'Portrait',
			      "label3": 'Paysage',
			      "label4": 'Portrait'
			    },
			    "legend": "Ajouter la légende à la sortie"
			},
			"share": {
				"extent": "Utiliser l’étendue courante de la carte",
				"label": "Partager cette carte",
				"link": "Lien de la carte",
				"facebook": "Facebook",
				"twitter": "Twitter"
			}
        },
        "tooltips":{
        	"home": "Etendue par défaut",
        	"locate": "Rechercher mon site",
        	"legend": "Légende",
        	"bookmarks": "Géosignets",
        	"layers": "Couches",
        	"basemap": "Galerie de fonds de carte",
        	"overview": "Vue générale",
        	"measure": "Mesurer",
        	"edit": "Modifier",
        	"time": "Heure",
        	"print": "Imprimer",
        	"details": "Détails",
        	"share": "Partager"
        }
    })

);
