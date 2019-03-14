import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet, AsyncStorage, Alert, Clipboard } from 'react-native'
import firebase from 'react-native-firebase'
import { Notification, NotificationOpen } from 'react-native-firebase';

export default class Loading extends React.Component {

  state = {
    logList: []
  }

   componentDidMount() {
    this.checkPermission()
    this.createNotificationListeners()
  }

  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }
  
  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
        this.getToken();
    } else {
        this.requestPermission();
    }
  }
  
  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    alert(fcmToken)
    Clipboard.setString(fcmToken)
    if (!fcmToken) {
        fcmToken = await firebase.messaging().getToken();
        alert(fcmToken)
        if (fcmToken) {
            // user has a device token
            await AsyncStorage.setItem('fcmToken', fcmToken);
        }
    }
  }
  
    //2
  async requestPermission() {
    try {
      alert('request')
        await firebase.messaging().requestPermission();
        // User has authorised
        this.getToken();
    } catch (error) {
        // User has rejected permissions
        console.log('permission rejected');
    }
  }
  
  async createNotificationListeners() {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification((notification) => {
        const { title, body } = notification;
        this.showAlert(title, body);
    });
  
    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
        const { title, body } = notificationOpen.notification;
        this.showAlert(title, body);
    });
  
    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
        const { title, body } = notificationOpen.notification;
        this.showAlert(title, body);
    }
    /*
    * Triggered for data only payload in foreground
    * */ 
    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      console.log(JSON.stringify(message));
    });
  }
  
  showAlert(title, body) {
    const {logList} = this.state
    const item = {title, body}
    Alert.alert(
      title, body,
      [
          { text: 'OK', onPress: () => console.log('OK Pressed', () => {
            logList.push(item)
            this.setState(logList)
          }) },
      ],
      { cancelable: false },
    );
  }

  render() {
    const {logList} = this.state
    return (
      <View style={styles.container}>
        <Text>Log List</Text>
        {logList.lenght > 0 ? logList.map(({item}) => (<Text>{`${item.title}: ${item.body}`}</Text>)) : (<ActivityIndicator size="large" />)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})