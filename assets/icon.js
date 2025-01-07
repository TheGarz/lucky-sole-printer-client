const { nativeImage } = require('electron');

// Simple printer icon in base64 format (16x16 pixels)
const iconBase64 = `iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADWSURBVDiNpZO7DcIwFEXPIzUdE7ACGzACS0BHRwsLMAIjsAEbUNIxAgtQ0tLBBpaxgTQoHwUHYSs4kuXn+5x7/QzGGGKUxKpigBhjEuAccBV4AjdjzK1qITP7UQZcgE5VD8CkqgNwB85fxSJyBFZhvQPaELciskhaVX0Bk4hsYwk64Doi8+TgDrRVxQBm1onIPYQ94AE8VHVWJQjJa1Wdq+oDeJrZJEpgZivgGsKdma1/EsR+40FE5t8S1AqMMdugc1TVMwkkXvN6RKf0rwnqkdX+xht9RXgBhPP5NAAAAABJRU5ErkJggg==`;

// Create a native image from base64
const createIcon = () => {
    return nativeImage.createFromDataURL(`data:image/png;base64,${iconBase64}`);
};

module.exports = { createIcon };
