import React, { Component, PropTypes } from 'react';
import {
	StyleSheet,
	View,
	Text,
	Image,
	Dimensions,
} from 'react-native';

import logoImg from '../../Images/logo.png';
import { appThemeColor } from '../../AppGlobalConfig';

export default class Logo extends Component {
	render() {
		return (
			<View style={styles.container}>
				<Image source={logoImg} style={styles.image} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	image: {
		width: 260,
		height: 60,
		marginBottom: 10
	}
});
// AppRegistry.registerComponent('AwesomeProject', () => Logo);
