import data from './config.json'
const ThemeService = {
    setActiveTheme: function() {
        //inspect the value
        Object.keys(data).forEach((item: any) => {
            document.documentElement.style.setProperty(item, data[item])
        });
    }
};

export default ThemeService;