

// import React from 'react';
// import LandingPage from './LandingPage';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <LandingPage />
//     </div>
//   );
// }

// export default App;




// import React from 'react';
// import LandingPage from './LandingPage';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <LandingPage />
//     </div>
//   );
// }

// export default App;




import React from 'react';
import { View, StyleSheet } from 'react-native';
import LandingPage from './LandingPage';

export default function App() {
  return (
    <View style={styles.container}>
      <LandingPage />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
