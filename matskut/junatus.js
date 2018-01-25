/***************************************************************************************************************
 * Ohjelma hakee aikataulutiedot kaikilta suomen asemilta ja sillä pystyy myös seuraamaan yksittäisen junan
 * etenemistä. Aikataulu päivittyy automaattisesti minuutin välein. 
 * "Liveseuranta" ominaisuus oli sinänsä typerää toteuttaa saman kyselyn datalla, kun sitä varten
 * olisi ollut ihan oma kyselynsä apissa, jolla toteutus olisi varmasti ollut paitsi parempi ja helpompi, niin
 * myös kevyempi, mutta tämä nyt oli lähinnä osastoa sain idean leikkiä yksittäisellä junaoliolla ja lähdin kokeilemaan
 * pystyisinkö toteuttamaan sen jotenkin.. 
 * ***************************************************************************************************************/




/*Jos dataa ei löydy = asemalla ei liikennettä hakuaikana. 
**tulostetaan Aseman nimi ja ilmoitus Ei junia*/
function emptyData(stationCode){
    $('#arrTimetable').html("Ei junia");
    $('#depTimetable').html("Ei junia");
    $('#tttitle').html('<h1>'+getName(stationCode)+'</h1>');
    $('#time').html('<h1>'+getTime(Date.now())+'</h1>');
  
}

//Luodaan "liveseuranta"-ikkunan sisältö. Otsikko + table-elementti sisältöineen:

function showRoute(routeStops){
    var popup="";
    popup="<h3><i>Vihreä</i> = Juna pysähtyy asemalla<br> <em>Punainen</em> = Juna ei pysähdy asemalla</h3><table><tr><th>Asema</th><th>Aikataulu</th><th>Toteutunut</th></tr>";
    $.each(routeStops,function(s, stop){
      var name=getName(stop.stationShortCode);
      
        if(s>0 && stop.type=="ARRIVAL"&&name!="Seisake"){ //Reitillä on sensoreita asemilla, joilla ei liikennettä. En halua näyttää näitä. Aikataulun+aseman otan aseman saapuvien junien sarakkeesta.
            if(stop.trainStopping==true){
                popup+=("<tr><td class='green'>"+ getName(stop.stationShortCode) + "</td><td class='center-yellow'>" + getTime(stop.scheduledTime) + "</td><td class='center'><i>" +getTime(stop.actualTime)+"</i></td></tr>");
            }else{
                popup+=("<tr><td class='red'><em>"+ getName(stop.stationShortCode) + "</em></td><td class='center-red'><em>" + getTime(stop.scheduledTime) + "</em></td><td class='center'><i>" +getTime(stop.actualTime)+"</i></td></tr>");
            }
        }else if(s==0){ //paitsi jos s==0, niin otetaan tietenkin departuresta..
            popup+=("<tr><td class='green'>"+ getName(stop.stationShortCode) + "</td><td class='center-yellow'>" + getTime(stop.scheduledTime) + "</td><td class='center'><i>" +getTime(stop.actualTime)+"</i></td></tr>");
        }
    })
    popup+="</table>";
    return(popup); //palautetaan live-seuranta ikkunan sisään tuleva innerhtml..
}

//Järjestetään junaoliot taulukossa pienimmästä suurimpaan pvm+kellonajan mukaan
function trainsSort(trains){
   
    var elem;
    var spanElem;
        trains=trains.sort(function(x, y){
        
            var time1=new Date(x.time), time2=new Date(y.time)
             return time1-time2
        })
        //ja pusketaan taulukko html:ään. Käytän appendia, joten tyhjennetään ensin elementit vanhoista tiedoista:
        $('#tttitle').html("");
        $('#time').html("");
        $('#arrTimetable').html("");
        $('#depTimetable').html("");
        $('#traintracker').html("");
        $('#tttitle').append('<h1>'+getName(trains[0].station)+'</h1>'); //Otsikko. Tämä asema + klo
        $('#time').append('<h1>'+getTime(Date.now())+'</h1>');
        $.each(trains,function(t,train){ //luupataan taulukko läpi:
            est=getTime(train.est); 
                if(est!=""){    //jos junalle on kirjattu arvioitu aika, niin tulostetaan Arvio + aika, muussa tapauksessa ei kirjata mitään.
                    est="Arvio "+est;
                }
               //live-elmentti, joka saa yksilöllisen id:n luupista, sisällön showroute funktiosta.. Lisäksi button, jolle luodaan alla eventlistener, joka hävittää klikkauksella elementin ruudulta 
            spanElem=$("<span class='live'id=train"+t+">"+showRoute(train.routeStops)+"<button class='buttons' id='livebutton'>Sulje ikkuna</button></span>");
            spanElem.click(function(){

                $(this).css({"visibility":"hidden"});
            });
          
            //lisätään aseman saapuvat junat HTML-virtaan + junan liveseuranta.
            if(train.type=="ARRIVAL"){
                elem=$("<tr><td class='yellow'<b>" +getTime(train.time)+'<img src="matskut/infoicon.png" title="Klikkaamalla riviä näet junan reitti-infon ja sijainnin tällä hetkellä." >' +" </b></td><td class='center'>"+train.train+"</td><td>"+train.from+"</td><td class='center'>"+train.track+"</td><td><b><i>"+est+"</i></b></td></tr>");
                elem.appendTo('#arrTimetable');
                spanElem.appendTo('#traintracker');
            //sama lähteville:    
            }else{

                elem=$('<tr><td class="yellow"><b>' +getTime(train.time)+'<img src="matskut/infoicon.png" title="Klikkaamalla riviä näet junan reitti-infon ja sijainnin tällä hetkellä." >'+"</b></td><td class='center'>"+train.train+"</td><td>"+train.target+"</td><td class='center'>"+train.track+"</td><td><b><i>"+est+"</i></b></td></tr>")
                elem.appendTo('#depTimetable');
                spanElem.appendTo('#traintracker');
                
            }
            //event listener aikatauluriville. Riviä klikkaamalla liveikkuna aukeaa.
            elem.click(function(){
                
              /* var visibility=$("#train"+t).css('visibility');
                if(visibility=='hidden'){ 
                    $("#train"+t).css({"visibility":"visible"});
                }else{
                    $("#train"+t).css({"visibility":"hidden"});
                }*/
               
                    $("#train"+t).slideToggle("slow");
                
                
            })
            //hover efekti riville.. Tätä, sen enempää kuin mouseon/mouseout tai hover funktiotakaan en saanut toimimaan vanhemmalla ie:llä. on/enter/hover kyllä toimii, mutta out/leave/hover pois päin ei..
            elem.mouseenter(function() {
                $( this).css({'background-color':'blue'});

              });
           
            elem.mouseleave(function() {
                
                $( this).css({'background-color':'initial'});
              });
            })  

        
}


//alustetaan käynnistettessä ohjelma:
var stations={};
$(document).ready(function(){
    
    stations=getStations(); //kutsutaan funktiota joka sijoittaa asemat pudotusvalikkoon
    function getStationCode(){
        var city=$('#station').val().toUpperCase(); //haluan palauttaa pudotusvalikosta nimen sijaan asematunnuksen..uppercasella yritetään eliminoida syötevirheitä jos käyttäjä kirjoittaa nimen itse..
        return stations[city]; //jonka saan käyttämällä nimeä hakuavaimena asemaoliolle
    }

    $('#pickbutton').click(function(){ //evenlistener hae-tiedot buttonille:
        
        var stationCode = getStationCode(); //haetaan aseman nimi

            $("#departure").show(); //näytetään oletuksena lähtevät junat
            $( "#arrival" ).hide(); 
            $('#depbutton').css({'background-color':'green'});  //lähtevät näkyy vihreänä
            $('#arrbutton').css({'background-color':'initial'});  //saapuvat ei
            $('#welcome').hide(); //piilotetaan sivulla ollut infoteksti
            if (stationCode!=undefined){ //jos validi tieto
                getTimetable(stationCode); //kutsutaan funktiota joka hakee aikataulutiedot
                setInterval(function(){ //ajastin, joka päivittää aikatauluja minuutin välein mikäli kentässä on jokin asema aktiivisena
                   console.log("toimin");
                    getTimetable(getStationCode());
                    }, 60000);
            } else{
                alert("Tarkista aseman kirjoitusasu, tai valitse se uudelleen valikosta"); //virheilmo jos asemaa ei löydy
            }
        
            
    })
    $('#mobilebox').change(function(){
        $("#departure").show(); //näytetään oletuksena lähtevät junat
        $( "#arrival" ).hide(); 
        $('#depbutton').css({'background-color':'green'});  //lähtevät näkyy vihreänä
        $('#arrbutton').css({'background-color':'initial'});  //saapuvat ei
        $('#welcome').hide(); //piilotetaan sivulla ollut infoteksti
        stationCode=this.value;
        getTimetable(stationCode);
        setInterval(function(){ //ajastin, joka päivittää aikatauluja minuutin välein mikäli kentässä on jokin asema aktiivisena

             getTimetable(stationCode);
             }, 60000);
    })
    
});
//näytä saapuvat ja lähtevät buttoneille eventlistenerit. vaihtavat näkymää, ja osoittavat napin värillä mikä on valittuna
$(document).ready(function(){
    
    $('#arrbutton').click(function(){;
        $("#departure").hide();
        $( "#arrival" ).show();
        $('#arrbutton').css({'background-color':'green'});
        $('#depbutton').css({'background-color':'initial'});
      });

});
$(document).ready(function(){
    
    $('#depbutton').click(function(){;
        $("#arrival").hide();
        $( "#departure" ).show();
        $('#arrbutton').css({'background-color':'initial'});
        $('#depbutton').css({'background-color':'green'});
      });

});

//haetaan aikataulut:
function getTimetable(stationCode){
   
    var url;
    
    if(stationCode=="HKI"||stationCode=="PSL" ||stationCode=="TKL"){
        var arrived;
        url="https://rata.digitraffic.fi/api/v1/live-trains?arrived_trains=0&arriving_trains=150&departed_trains=0&departing_trains=150&station="+encodeURIComponent(stationCode);
    }else{
        url="https://rata.digitraffic.fi/api/v1/live-trains?arrived_trains=0&arriving_trains=80&departed_trains=0&departing_trains=80&station="+encodeURIComponent(stationCode);
    }
        var target;
        var arrived;
        var trainNro;
        var elem;
        var trainsObject={};
        var trains=[];
        var stops={};
        var type;
        //api kutsu + tarkistus että status ok
        $.getJSON(url,function(data,status){
            if(status=="success"){
              $('#footer').hide();
                if(data.length==0){ //jos asemalta ei saada dataa=ei liikennettä, niin kutsutaan emptydata funktiota ja lopetetaan toiminta
                  emptyData(stationCode);
                  return;
              }                            
                $.each(data,function(i, item){ //luupataan data läpi
                    arrived=getName(item.timeTableRows[0].stationShortCode) //mistä
                    target=getName(item.timeTableRows[item.timeTableRows.length-1].stationShortCode); //mihin
                    stops=item.timeTableRows; //pysäkkiaikataulu, jonka tallennan junaolioon liveseurantaa varten.
                    if(item.commuterLineID!=""){ //haetaan junatunnus tai junannumero:
                        trainNro=item.commuterLineID;
                    }
                    else{
                        trainNro=item.trainType+item.trainNumber;
                    } 
                    
                    if(item.trainCategory!="Cargo" &&item.trainCategory!="Shunting"){ //jos rahtijuna, tai joku jota en enää muista, niin ohitetaan juna
                    $.each(item.timeTableRows,function getTrains(t, train){ //käydään junan aikatauludata läpi
                        var index;
                        type=train.type;
                      
                        if(train.stationShortCode==stationCode&&stationCode!="HKI"){ //jos asema ei helsinki
                            if (trainNro=="I" || trainNro=="P"){ //I & P junien reitti oletuksena helsinki-helsinki.. Halusin muotoon helsinki-lentoasema-helsinki, joten pieni jumppa alle..
                                
                            for(s in stops){
                
                                if(stops[s].stationShortCode=="LEN"){ 
                                    index=s; //haetaan lentoaseman indeksi
                                }      
                            }
                            if(t>index){ //verrataan aseman indeksiin.. Jos asema ohittanut, niin target helsinki ja arrived Lentoasema..
                                target="HELSINKI"; 
                                arrived="LENTOASEMA";
                            } 
                            if(t<index){ //vice versa
                                target="LENTOASEMA";
                                arrived="HELSINKI"
                            }
                            if(t==index||t==index+1){ //jos valittu asema on lentoasema
                                target="HELSINKI";
                                arrived="HELSINKI"
                            }
                            
                        
                        } 
                        if(train.stationShortCode==stationCode&&stationCode=="PSL" && trainNro=="I" || trainNro=="P"){
                            
                            if(Date.parse(train.scheduledTime)>=Date.now()){ //I ja P junien data palautuu apikyselyssä myös hki ja psl niin kauan kun juna liikenteessä, joten pitää hyljätä heidät tässä vaiheessa etteivät päädy ruudulle asti
                                trainsObject=({time:train.scheduledTime, station:train.stationShortCode, train:trainNro, from:arrived,target:target, track:train.commercialTrack, est:train.liveEstimateTime, type:type, routeStops:stops})
                                trains[trains.length]=trainsObject;
                            }
                        }else{  
                            trainsObject=({time:train.scheduledTime, station:train.stationShortCode, train:trainNro, from:arrived,target:target, track:train.commercialTrack, est:train.liveEstimateTime, type:type, routeStops:stops});
                            trains[trains.length]=trainsObject;
                        }  
                        }
                        //helsinki poikkeus vielä lentokenttäjunien kanssa:
                        if(train.stationShortCode==stationCode&&stationCode=="HKI"){
                            if (trainNro=="I"||trainNro=="P" ){ 
                                target="LENTOASEMA";
                                arrived="LENTOASEMA";
                                if(Date.parse(train.scheduledTime)>=Date.now()){ //I ja P junien data palautuu apikyselyssä myös lähtöasemalle niin kauan kun juna liikenteessä, joten pitää hyljätä heidät tässä vaiheessa etteivät päädy ruudulle asti
                                    trainsObject=({time:train.scheduledTime, station:train.stationShortCode, train:trainNro, from:arrived,target:target, track:train.commercialTrack, est:train.liveEstimateTime, type:type, routeStops:stops});
                                   
                                    trains[trains.length]=trainsObject;
                                } 
                            }
       
                            else{ //ei tarvetta kikkailuihin muiden helsingin junien kanssa:
                                trainsObject=({time:train.scheduledTime, station:train.stationShortCode, train:trainNro, from:arrived,target:target, track:train.commercialTrack, est:train.liveEstimateTime, type:type, routeStops:stops});          
                                trains[trains.length]=trainsObject 
                            }
                        }
                    })
                    }  
                
                })
                //kutsutaan funktiota joka sorttaa junat aikajärjestykseen ja puskee ne ruudulle
                trainsSort(trains);
                       
            } else{
                console.log("something went wrong"); 
            } 
        })   
};
//funktio kääntää asematunnuksen nimeksi
function getName(stationCode){
var index=-1;
    for (var station in stations){ //luupataan asemaoliot lävitse
        
        if(stations[station]==stationCode){
            a=station.indexOf(" ASEMA"); //asema päätteiset nimet siistimmäksi.. Joku mihin se kuuluu osui silmään, mutta tuolla välilyönnillä sai sen taklattua
            b=station.indexOf("_("); //Pietarin & Moskovan perästä ylimääräinen tauhka pois
            if(a>-1){
                return station.substring(0,a); //parsitaan nimi ja palautetaan kutsujalle
                break; 
            }
            if(b>-1){
                return station.substring(0,b); //kuin myös
                break; 
            }
            else{
            return station; //palautetaan tapauksissa joissa ei parsittavaa (paluuarvo on olion key, koska olio muodossa key:nimi, value:tunnus)
            break; 
            }
        }  
       
    }
    return "Seisake"; //jos nimeä ei listassa, niin undefinedin sijaan palautetaan "Seisake"
}

//parsitaan kellonaika kivempaan muotoon:
function getTime(time) {
    var d = new Date(time);
    if(isNaN(d)){
        return "";
    }
    else{
        var d = new Date(time);
        var hours=d.getHours();
        var min=d.getMinutes();
            if(hours<10){
             hours="0"+hours;
            }
            if(min<10){
                min="0"+min;
            } 
    }
    return hours+":"+min;
}
//haetaan asemalista pudotusvalikkoon apista:
function getStations(){
    var url="https://rata.digitraffic.fi/api/v1/metadata/stations";
    var stations={};
    $.getJSON(url,function(data,status){
        if(status=="success"){
            $.each(data, function(i, item){
                if(item.passengerTraffic!=false){
                  
                  $("<option>").attr("value", item.stationName.toUpperCase()).appendTo('#trainStations');
                  $("<option>").attr("value", item.stationShortCode).text(item.stationName).appendTo('#mobilebox');
                    stations[item.stationName.toUpperCase()] = item.stationShortCode;
                   
                    
                } 
                else{
                }
            })
        }
        else{
            console.log("Something went wrong");
        }
    })
    return stations;
};


