export const symbolMarker:any = {
    type: 'esriSMS',
    style: 'esriSMSCircle',
    color: [255, 255, 255],
    size: 12,
    angle: 0,
    xoffset: 0,
    yoffset: 0,
    outline: {
        type: 'esriSLS',
        style: 'esriSLSSolid',
        color: [0, 255, 255],
        width: 3,
    },
};
export const symbolPolyline:any = {
    type: 'esriSLS',
    style: 'esriSLSSolid',
    color: [0, 255, 255],
    width: 3,
};
export const symbolPolygon :any = {
    type: "simple-fill",  // autocasts as new SimpleFillSymbol()
    //color: "red",
    outline: {  // autocasts as new SimpleLineSymbol()
        color: [21, 181, 74, 255],
        width: "2px"
    }
}