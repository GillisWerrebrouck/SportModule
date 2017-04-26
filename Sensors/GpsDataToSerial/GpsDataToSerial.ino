#include <SoftwareSerial.h>
#define BUTTON_PIN 20

SoftwareSerial SoftSerial(2, 3);
char buffer[256];
int count=0;
boolean routeStarted = false;

unsigned long interval = 1000; // the time we need to wait
unsigned long previousMillis = 0; // millis() returns an unsigned long.

void setup()
{
  SoftSerial.begin(9600);
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT);
}

void loop()
{
  checkButton();
  
  unsigned long currentMillis = millis(); // grab current time

  // check if "interval" time has passed (1000 milliseconds)
  if ((unsigned long)(currentMillis - previousMillis) >= interval) {
    checkGPS();
    // save the "current" time
    previousMillis = millis();
  }
}

boolean previousButtonState = false;

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
          
          //String sLat = getValue(value,',',2);
          //float fLat = (sLat.substring(0,2)).toFloat() + (sLat.substring(2,4)).toFloat() / 60.0f + (sLat.substring(4,9)).toFloat() / 60.0f;
          //String sLong = getValue(value,',',4);
          //float fLong = (sLong.substring(0,2)).toFloat() + (sLong.substring(2,4)).toFloat() / 60.0f + (sLong.substring(4,9)).toFloat() / 60.0f;

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

          String geo = "{\"latitude\":\"" + sLat + "\",\"latd\":\"" + sLatd + "\",\"longitude\":\"" + sLong + "\",\"longd\":\"" + sLongd + "\",\"altitude\":\"" + sAlt + "\"}";

          Serial.println("#");
          delay(50);
          Serial.println(geo);
          delay(50);
          Serial.println("#");
          delay(50);
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
