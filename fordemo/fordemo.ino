#include "esp_wpa2.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "time.h"

#include <Arduino.h>
#include "EmonLib.h"
#include <driver/adc.h>
#include <LiquidCrystal_I2C.h>


const char* ssid = "TMU"; // your ssid
#define EAP_ID "jblaszkow@torontomu.ca"
#define EAP_USERNAME "jblaszkow@torontomu.ca"
#define EAP_PASSWORD "Question18!"

const char* ntpServer = "pool.ntp.org";


unsigned long lastTime = 0;
unsigned long timerDelay = 1000;

struct ab{
  String sensor;
  unsigned long epochtime; 
  double source;
};

String response = "";

const char* host = "http://86d3-141-117-117-139.ngrok.io/";
//const char* host = "http://httpbin.org/anything";



#define ADC_INPUT4 32                     //A4 voltage  
#define ADC_INPUT 34                      // current
#define ADC_BITS    12                    //Force EmonLib to use 12 bit ADC resolution
#define ADC_COUNTS  (1<<ADC_BITS)
#define emonTxV3                          //Force the library to use 3v3 as supply voltage
#define LED_BUILTIN 2

//Variables

double currentCalibr = 26.5;                                                             //Default
double homeVoltage =   111.1; 
double sampleperiod = 1000;                                                             //Default
double kWhCost =  2.03;                                                             //Default
double phaseShift =  1.9;                                                             //Default
double power = 0.0;
double current = 0.0;
double voltage = 0.0;
float powerkva = 0.0;
unsigned long previousMillis = 0;

EnergyMonitor emon1;             // Create an instance
LiquidCrystal_I2C lcd(0x27, 16, 2);




void setup() {
  Serial.begin(115200);
  delay(10);
  configTime(0, 0, ntpServer);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  esp_wifi_sta_wpa2_ent_set_identity((uint8_t *)EAP_ID, strlen(EAP_ID));
  esp_wifi_sta_wpa2_ent_set_username((uint8_t *)EAP_USERNAME, strlen(EAP_USERNAME));
  esp_wifi_sta_wpa2_ent_set_password((uint8_t *)EAP_PASSWORD, strlen(EAP_PASSWORD));
  esp_wpa2_config_t config = WPA2_CONFIG_INIT_DEFAULT();
  esp_wifi_sta_wpa2_ent_enable(&config);
  
  WiFi.begin(ssid);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());  


    //Setup the ADC

  adc1_config_channel_atten(ADC1_CHANNEL_0, ADC_ATTEN_DB_11);          //ADC attenuation

  analogReadResolution(ADC_BITS);            //Force library to read 12 bit processor
  pinMode(ADC_INPUT, INPUT);                 //Current pin input from current transformer
  pinMode(ADC_INPUT4, INPUT);                //Voltage pin from AC transformer
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  emon1.voltage(ADC_INPUT4, homeVoltage, phaseShift);       //Voltage: input pin, calibration, phase_shift
  emon1.current(ADC_INPUT, currentCalibr);
  lcd.init();
  lcd.backlight();


}


void loop() {

  //because sensor gathering will be running in the loop, and the loop is what gathers the sensor values, 
  //so don't call the post request or do the calculation until the data collection is complete 
  //so abstract the source away and don't leave it in the post request 

  //this one is still working (returns 200)
  //const char* host = "http://httpbin.org/anything";

 
  if ((millis() - lastTime) > timerDelay) {
    //Check WiFi connection status
    if(WiFi.status()== WL_CONNECTED){
      
      Serial.println("posting method...");
      response = httpPOSTRequest(host);
//      Serial.println(response);
    }
     else {
      Serial.println("WiFi Disconnected");
      }
      lastTime = millis();
    }
}


// pass sensor  values into this function 
String httpPOSTRequest(const char* host) {
  WiFiClient client;
  HTTPClient http;
  
  
  // Your Domain name with URL path or IP address with path
  http.begin(client, host);

  Serial.println("grabbed data successfully  ");
  ab vals;
  vals = sensorvals();
  
  http.addHeader("Content-Type","application/json");
  
 StaticJsonDocument<128> doc;

  doc["sensor"] = vals.sensor;
  doc["time"] = vals.epochtime;
  doc["data"][0] = vals.source;

  String output;
  serializeJson(doc, output);
  Serial.println(output);
  
  int httpResponseCode = http.POST(output);

  String payload = "{}"; 

  if (httpResponseCode>0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    payload = http.getString();
  }
  else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  // Free resources
  http.end();

  return payload;
}

 

struct ab sensorvals(){
  struct ab ab_instance;
  double randomnumber;
  
  //randomnumber = random(200);
  //Serial.println(epochtime);
  //Serial.println(randomnumber);
   unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= sampleperiod){
    previousMillis = currentMillis;

  //Calculate Power
  emon1.calcVI(20,2000);         // Calculate all. No.of half wavelengths (crossings), time-out

 if (emon1.Irms <= 1.25){        // Current less than 1.25 is attributed to noise

  power = 0;
  powerkva = 0;
  current = 0;
 }
else{                                            //All current greater than the light bulb current a.k.a the Blow dryer
    power = emon1.realPower * 2.23;
    powerkva = emon1.apparentPower * 2.23;
    current = emon1.Irms;
}

if (power < 0){
  power = power*-1;
}
  voltage = emon1.Vrms;

  lcd.clear();
  
  lcd.setCursor(1,0);

  //lcd.print("Irms: ");
  lcd.print(current);
  lcd.print("A||");
  //lcd.print("Vrms: ");
  lcd .print(voltage);
  lcd.print("V");

  lcd.setCursor(0,1);
  //lcd.print("W&S:");
  lcd.print(power);
  lcd.print("W,");
  lcd.print(powerkva);
  lcd.print("VA ");
  }
  Serial.println(power);
  //Serial.println(epochtime);
  if(power<2000){
    ab_instance.sensor = "testsensor";
    ab_instance.epochtime = getTime();
    ab_instance.source = power;
   // ab_instance.source = power;
    return ab_instance;
  }
}

unsigned long getTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    //Serial.println("Failed to obtain time");
    return(0);
  }
  time(&now);
  return now;
}
