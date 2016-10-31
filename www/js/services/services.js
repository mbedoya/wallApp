var servicesModule = angular.module('wall.services', [])
.factory('Utility', function () {

        this.padStr = function (i) {
            return (i < 10) ? "0" + i : "" + i;
        };

        var self = this;

        return {
            getDateDiffFormatted: function (startDate, endDate) {

                startDate = new Date(startDate);

                if (!endDate) {
                    endDate = new Date();
                } else {
                    endDate = new Date(endDate);
                }

                multiplicador = startDate < endDate ? 1 : -1;
                var diferenciaTiempo = Math.abs(endDate - startDate);
                var diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));

                result = diferenciaDias * multiplicador;

                if (result == 0) {

                    var diferenciaHoras = Math.floor(diferenciaTiempo / (1000 * 3600));   

                    //was it yesterday?
                    if(startDate.getDate() != endDate.getDate()
                        && startDate.getMonth() == endDate.getMonth()
                        && startDate.getFullYear() == endDate.getFullYear()){
                            return "ayer";
                    }

                    if (diferenciaHoras <= 12) {

                        if (diferenciaHoras == 0) {

                            var diferenciaMinutos = Math.floor(diferenciaTiempo / (1000 * 60));

                            if (diferenciaMinutos == 0) {
                                return "recién";
                            }

                            return "hace " + diferenciaMinutos + " minutos";

                        }

                        return "hace " + diferenciaHoras + " horas";
                    }

                    return "hoy";
                }

                if (result == 1) {
                    return "ayer";
                }

                return "hace " + result + " días";
            },
            getCurrentDate: function () {
                var dateStr = new Date().toISOString();

                return dateStr;
            }
        }
    });