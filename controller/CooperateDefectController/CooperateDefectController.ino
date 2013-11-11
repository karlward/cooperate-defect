

int xAxis = A1;    // select the input pin for the potentiometer
int yAxis = A0;    // select the pin for the LED
int button = 8;
int cooperateLed = 3;
int defectLed =4 ;
//int cooperateLED = 8;
int xVal=0;
int yVal =0;

int left =37 ;
int up=38;
int right = 39;
int down = 40;

const int xLeftThreshold = 300;
const int xRightThreshold = 500;
const int yDownThreshold = 300;
const int yUpThreshold = 500;
int previousButtonState = HIGH;
boolean currentMode = LOW;
void setup() {
  while(!Serial){
  }
  
  pinMode(xAxis, INPUT);  // declare the ledPin as an OUTPUT
  pinMode(yAxis, INPUT);
  pinMode(button, INPUT);
  pinMode(cooperateLed, OUTPUT);
  pinMode(defectLed, OUTPUT);
   Keyboard.begin();
  digitalWrite(button,HIGH);
  Serial.begin(9600);

}
void loop() {

  xVal = analogRead(xAxis);
  yVal = analogRead(yAxis);
  boolean buttonState = (boolean)digitalRead(button);
  if(xVal< xLeftThreshold){
    Serial.println("Left");
    Keyboard.write(KEY_LEFT_ARROW);
  }

  if(xVal > xRightThreshold){
    
    Serial.println("Right");
    Keyboard.write(KEY_RIGHT_ARROW);
  }

  if(yVal > yUpThreshold){
    Serial.println("Up");
    Keyboard.write(KEY_UP_ARROW);
  }

  if(yVal < yDownThreshold){
    Serial.println("Down");
    Keyboard.write(KEY_DOWN_ARROW);
  }

  if((buttonState != previousButtonState) && (buttonState == LOW)){
      Serial.println("Button Pressed");
    if(currentMode == LOW){
      Serial.println("Cooperate");
      digitalWrite(cooperateLed, HIGH);
      digitalWrite(defectLed, LOW);
      Keyboard.print('c');
    }
    else if(currentMode == HIGH){
      Serial.println("Defect");
  digitalWrite(cooperateLed, LOW);
      digitalWrite(defectLed, HIGH);
      Keyboard.print('d');
    }  
    currentMode = !currentMode;
  }
  
  previousButtonState = buttonState;

  delay(100);
}


