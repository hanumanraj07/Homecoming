import { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './ui/Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            Homecoming ran into an unexpected error. Your data is safe — try again.
          </Text>
          <Button title="Try again" onPress={this.handleReset} style={styles.button} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F7F8FA',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#12151A',
  },
  message: {
    fontSize: 14,
    color: '#5B6470',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
  },
});
