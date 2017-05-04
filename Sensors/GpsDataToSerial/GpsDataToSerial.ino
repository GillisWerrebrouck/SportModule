/*--- GROVE GPS ---*/
#include <SoftwareSerial.h>
/*-----------------*/

/*--- TPH V2 ---*/
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
/*--------------*/

/*--- GROVE BUTTON ---*/
#define BUTTON_PIN 20
/*--------------------*/

/*--- TPH V2 ---*/
#define BME_SCK 13
#define BME_MISO 12
#define BME_MOSI 11
#define BME_CS 10
#define SEALEVELPRESSURE_HPA (1013.25)
/*--------------*/

SoftwareSerial SoftSerial(2, 3);
char buffer[256];
int count=0;
boolean routeStarted = false;

unsigned long ledInterval = 300;
unsigned long tphInterval = 1000;
unsigned long gpsInterval = 1000;
unsigned long previousMillisLED = 0;
unsigned long previousMillisTPHv2 = 0;
unsigned long previousMillisGPS = 0;

boolean previousButtonState = false;
boolean bLed1State = false;
boolean bLed1 = false;
boolean bLed2State = false;
boolean bLed2 = false;

Adafruit_BME280 bme;

float currentTemperature;
float currentPressure;
float currentHumidity;

void setup()
{
  pinMode(LED1, OUTPUT);
  digitalWrite(LED1, LOW);
  bLed1 = true;
  pinMode(LED2, OUTPUT);
  digitalWrite(LED2, LOW);
  
  bme.begin();
  SoftSerial.begin(9600);
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT);
}

void loop()
{
  checkButton();
  
  unsigned long currentMillis = millis();
  
  if ((unsigned long)(currentMillis - previousMillisLED) >= ledInterval) {
    setLed(2);
    previousMillisLED = millis();
  }
  
  if ((unsigned long)(currentMillis - previousMillisTPHv2) >= tphInterval) {
    checkTPHv2();
    previousMillisTPHv2 = millis();
  }

  if ((unsigned long)(currentMillis - previousMillisGPS) >= gpsInterval) {
    checkGPS();
    previousMillisGPS = millis();
  }
}

void checkButton()
{
  boolean currentButtonState = digitalRead(BUTTON_PIN);
  if (previousButtonState != currentButtonState && digitalRead(BUTTON_PIN) == HIGH){
    routeStarted = !routeStarted;
    if(routeStarted)
      Serial.println("1");
    else
      Serial.println("0");
  }

  previousButtonState = currentButtonState;
}

void setLed(int led)
{
  if(led == 1 && bLed1)
  {
      bLed1State = !bLed1State;
      if(bLed1State)
        digitalWrite(LED1, HIGH);
      else
        digitalWrite(LED1, LOW);
  }
  else
  {
    digitalWrite(LED1, LOW);
  }
  
  if(led == 2 && bLed2)
  {
      bLed2State = !bLed2State;
      if(bLed2State)
        digitalWrite(LED2, HIGH);
      else
        digitalWrite(LED2, LOW);
  }
  else
  {
    digitalWrite(LED2, LOW);
  }
}

void checkTPHv2()
{
  currentTemperature = bme.readTemperature();
  currentPressure = bme.readPressure() / 100.0F;
  currentHumidity = bme.readHumidity();
}

void checkGPS()
{
  if (SoftSerial.available())
  {
    while(SoftSerial.available())
    {
      buffer[count++]=SoftSerial.read();
      if(count == 256)break;
    }

    String value = "";

    if(String(char(buffer[0])) + char(buffer[1]) + char(buffer[2]) + char(buffer[3]) + char(buffer[4]) + char(buffer[5]) == "$GPGGA"){
      boolean isEnd = false;
      int commaCount = 0;

      for(int i = 6; isEnd == false; i++){            
        if(buffer[i] == 44)
          commaCount++;
            
        if(commaCount == 15)
          isEnd = true;

        if(isEnd == true){
          for(int x = 0; x <= i; x++){
            char current = char(buffer[x]);
            if(current == '\r')
              break;
            value += current;
          }
          
          String sLat = getValue(value,',',2);
          if(sLat == "")
            sLat = "0";
          String sLatd = getValue(value,',',3);
          
          String sLong = getValue(value,',',4);
          if(sLong == "")
            sLong = "0";
          String sLongd = getValue(value,',',5);
          
          String sAlt = getValue(value,',',9);
          if(sAlt == "")
            sAlt = "0";

          if(sLat == "0" || sLong == "0")
          {
            bLed1 = true;
            setLed(1);
            bLed1State = false;
            bLed2 = false;
          }
          else
          {
            bLed1 = false;
            bLed2 = true;
          }

          String data = "{\"latitude\":\"" + sLat + "\",\"latd\":\"" + sLatd + "\",\"longitude\":\"" + sLong + "\",\"longd\":\"" + sLongd + "\",\"altitude\":\"" + sAlt + "\",\"T\":\"" + currentTemperature + "\",\"P\":\"" + currentPressure + "\",\"H\":\"" + currentHumidity + "\"}";

          Serial.println("#");
          delay(25);
          Serial.println(data);
          delay(100);
          Serial.println("#");
          delay(25);
        }
      }
    }
    
    clearBufferArray();
    count = 0;
  }
}

void clearBufferArray()
{
  for (int i=0; i<count;i++)
    buffer[i]=NULL;
}

String getValue(String data, char separator, int index)
{
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length()-1;

  for(int i=0; i<=maxIndex && found<=index; i++){
    if(data.charAt(i)==separator || i==maxIndex){
        found++;
        strIndex[0] = strIndex[1]+1;
        strIndex[1] = (i == maxIndex) ? i+1 : i;
    }
  }

  return found>index ? data.substring(strIndex[0], strIndex[1]) : "";
}
