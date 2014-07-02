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
            "error": "Det gick inte att skapa kartan"
        },
        "tools":{
	    	"print": {
			    "layouts":{
			      "label1": 'Liggande (PDF)',
			      "label2": 'Stående (PDF)',
			      "label3": 'Liggande (bild)',
			      "label4": 'Stående (bild)'
			    },
			    "legend": "Lägg till teckenförklaring i utdata"
			},
			"share": {
				"extent": "Använd aktuell kartutbredning",
				"label": "Dela den här kartan",
				"link": "Kartlänk",
				"facebook": "Facebook",
				"twitter": "Twitter"
			}
        },
        "tooltips":{
        	"home": "Standardutbredning",
        	"locate": "Hitta min plats",
        	"legend": "Teckenförklaring",
        	"bookmarks": "Bokmärken",
        	"layers": "Lager",
        	"basemap": "Galleri för baskarta",
        	"overview": "Översiktskarta",
        	"measure": "Mät",
        	"edit": "Redigera",
        	"time": "Tid",
        	"print": "Skriv ut",
        	"details": "Information",
        	"share": "Dela"
        }
    })

);
