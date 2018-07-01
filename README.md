# ezdoc

Pre-requisites:
1. Install Node.js
2. Any text editor of your choice
3. Android studio, Java

Steps to run the project:
1. yarn install or npm install

Correction required to make the project work:
In file ..\node_modules\react-native-pdf-view\PDFView.android.js
Change:
import React,{ Component, PropTypes } from 'react';
to
import React,{ Component } from 'react';
import PropTypes from 'prop-types';