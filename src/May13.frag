precision highp float;

out vec4 fragColor;
uniform vec2 u_resolution;
uniform float radius;
uniform float alpha;

float sdfSphere(vec3 pt, vec3 c, float r){
    return length(pt-c)-r;
}

float sdf(vec3 pt){
    float d1 = sdfSphere(pt,vec3(0.0,0.2,0.0),0.1*radius);
    float d2 = sdfSphere(pt,vec3(0.0,0.0,0.0),0.2*radius);
    
    return min(d1,d2);
}
vec3 rayStep(vec3 pt,vec3 ray){
    return pt+sdf(pt)*ray;//現在地からray方向に距離sdf(pt)だけ進む
}

vec3 rayMarching(vec3 pt,vec3 ray){
    for(int i = 0;i<200;i++){
        if(abs(sdf(pt))<0.005){
            return pt;
        }
        //pt = pt + sbf(pt)*ray;下と同じ
        pt = rayStep(pt,ray);
    }
    return vec3(10000.0,10000.0,10000.0);
}
vec3 sdfNormal(vec3 pt){//法線ベクトル
    float eps = 0.005;
    float fx = (sdf(pt+vec3(eps,0,0))-sdf(pt))/eps;
    float fy = (sdf(pt+vec3(0,eps,0))-sdf(pt))/eps;
    float fz = (sdf(pt+vec3(0,0,eps))-sdf(pt))/eps;

    return normalize(vec3(fx,fy,fz));
}

void main(){
    vec2 p = gl_FragCoord.xy/u_resolution.x;
    p = 2.0*p - 1.0;

    vec3 light = vec3(0.0,100.0,100.0);
    vec3 camera = vec3(0.0,0.0,10.0);//カメラの位置
    vec3 cdir = vec3(0.0,0.0,-1.0);//視線の方向
    vec3 updir = vec3(0.0,1.0,0.0);//カメラの角度
    float depth = 7.0;
    vec3 rightdir = cross(cdir,updir);
    vec3 ray = p.x*rightdir + p.y*updir + depth*cdir;//視線の方向
    ray = normalize(ray);//長さを１にする

    vec3 pt = rayMarching(camera,ray);

    if(abs(sdf(pt))<0.01){
        vec3 lightray = normalize(light-pt);
        float intensity = dot(lightray,sdfNormal(pt));//内積はdot
        fragColor= vec4(intensity,intensity,intensity,1.0);
    }
    else{
        fragColor= vec4(0.0,0.0,0.0,0.0);
    }
}