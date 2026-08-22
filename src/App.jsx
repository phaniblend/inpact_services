import { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LandingPage, { LESSON_LIST, buildAngularLessonList } from './LandingPage'
import { getLessonPrereqs } from './reactTsCurriculum.js'
import { getLessonCount } from './trackLessonCounts.js'
import { MOBILE_ANGULAR_LESSONS } from './mobileAngularLessons.js'
import { TS_FUNDAMENTALS_CURRICULUM } from './engines/typescript/inpact_tsf_index'
import { JS_FUNDAMENTALS_CURRICULUM } from './engines/javascript/inpact_jsf_index'
import { NODE_FUNDAMENTALS_CURRICULUM } from './engines/node/inpact_nodef_index'
import {
  ENGINES_JS_INTERVIEW,
  ENGINES_TS_INTERVIEW,
  ENGINES_NODE_INTERVIEW,
  JS_INTERVIEW_CURRICULUM,
  TS_INTERVIEW_CURRICULUM,
  NODE_INTERVIEW_CURRICULUM,
} from './engines/interview/interviewEngines'
import INPACTEngineTSF01 from './engines/typescript/inpact_tsf01_engine'
import INPACTEngineTSF02 from './engines/typescript/inpact_tsf02_engine'
import INPACTEngineTSF03 from './engines/typescript/inpact_tsf03_engine'
import INPACTEngineTSF04 from './engines/typescript/inpact_tsf04_engine'
import INPACTEngineTSF05 from './engines/typescript/inpact_tsf05_engine'
import INPACTEngineTSF06 from './engines/typescript/inpact_tsf06_engine'
import INPACTEngineTSF07 from './engines/typescript/inpact_tsf07_engine'
import INPACTEngineTSF08 from './engines/typescript/inpact_tsf08_engine'
import INPACTEngineTSF09 from './engines/typescript/inpact_tsf09_engine'
import INPACTEngineTSF10 from './engines/typescript/inpact_tsf10_engine'
import INPACTEngineJSF01 from './engines/javascript/inpact_jsf01_engine'
import INPACTEngineJSF02 from './engines/javascript/inpact_jsf02_engine'
import INPACTEngineJSF03 from './engines/javascript/inpact_jsf03_engine'
import INPACTEngineJSF04 from './engines/javascript/inpact_jsf04_engine'
import INPACTEngineJSF05 from './engines/javascript/inpact_jsf05_engine'
import INPACTEngineJSF06 from './engines/javascript/inpact_jsf06_engine'
import INPACTEngineJSF07 from './engines/javascript/inpact_jsf07_engine'
import INPACTEngineJSF08 from './engines/javascript/inpact_jsf08_engine'
import INPACTEngineJSF09 from './engines/javascript/inpact_jsf09_engine'
import INPACTEngineJSF10 from './engines/javascript/inpact_jsf10_engine'
import INPACTEngineJSF12 from './engines/javascript/inpact_jsf12_engine'
import INPACTEngineJSF13 from './engines/javascript/inpact_jsf13_engine'
import INPACTEngineJSF14 from './engines/javascript/inpact_jsf14_engine'
import INPACTEngineJSF15 from './engines/javascript/inpact_jsf15_engine'
import INPACTEngineNODEF01 from './engines/node/inpact_nodef01_engine'
import INPACTEngineNODEF02 from './engines/node/inpact_nodef02_engine'
import INPACTEngineNODEF03 from './engines/node/inpact_nodef03_engine'
import INPACTEngineNODEF04 from './engines/node/inpact_nodef04_engine'
import INPACTEngineNODEF05 from './engines/node/inpact_nodef05_engine'
import INPACTEngineNODEF06 from './engines/node/inpact_nodef06_engine'
import INPACTEngineNODEF07 from './engines/node/inpact_nodef07_engine'
import INPACTEngineNODEF08 from './engines/node/inpact_nodef08_engine'
import INPACTEngineNODEF09 from './engines/node/inpact_nodef09_engine'
import INPACTEngineNODEF10 from './engines/node/inpact_nodef10_engine'
import INPACTEngineNODEF11 from './engines/node/inpact_nodef11_engine'
import INPACTEngineNODEF12 from './engines/node/inpact_nodef12_engine'
import INPACTEngineNODEF13 from './engines/node/inpact_nodef13_engine'
import INPACTEngineNODEF14 from './engines/node/inpact_nodef14_engine'
import INPACTEngineNODEF15 from './engines/node/inpact_nodef15_engine'
import { EXPRESS_FUNDAMENTALS_CURRICULUM } from './engines/express/inpact_expf_index'
import INPACTEngineEXPF01 from './engines/express/inpact_expf01_engine'
import INPACTEngineEXPF02 from './engines/express/inpact_expf02_engine'
import INPACTEngineEXPF03 from './engines/express/inpact_expf03_engine'
import INPACTEngineEXPF04 from './engines/express/inpact_expf04_engine'
import INPACTEngineEXPF05 from './engines/express/inpact_expf05_engine'
import INPACTEngineEXPF06 from './engines/express/inpact_expf06_engine'
import INPACTEngineEXPF07 from './engines/express/inpact_expf07_engine'
import INPACTEngineEXPF08 from './engines/express/inpact_expf08_engine'
import INPACTEngineEXPF09 from './engines/express/inpact_expf09_engine'
import INPACTEngineEXPF10 from './engines/express/inpact_expf10_engine'
import INPACTEngineEXPF11 from './engines/express/inpact_expf11_engine'
import INPACTEngineEXPF12 from './engines/express/inpact_expf12_engine'
import { PYTHON_FUNDAMENTALS_CURRICULUM } from './engines/python/inpact_pyf_index'
import INPACTEnginePYF01 from './engines/python/inpact_pyf01_engine'
import INPACTEnginePYF02 from './engines/python/inpact_pyf02_engine'
import INPACTEnginePYF03 from './engines/python/inpact_pyf03_engine'
import INPACTEnginePYF04 from './engines/python/inpact_pyf04_engine'
import INPACTEnginePYF05 from './engines/python/inpact_pyf05_engine'
import INPACTEnginePYF06 from './engines/python/inpact_pyf06_engine'
import INPACTEnginePYF07 from './engines/python/inpact_pyf07_engine'
import INPACTEnginePYF08 from './engines/python/inpact_pyf08_engine'
import INPACTEnginePYF09 from './engines/python/inpact_pyf09_engine'
import INPACTEnginePYF10 from './engines/python/inpact_pyf10_engine'
import INPACTEnginePYF11 from './engines/python/inpact_pyf11_engine'
import INPACTEnginePYF12 from './engines/python/inpact_pyf12_engine'
import { SD_CURRICULUM } from './engines/sd/inpact_sd_index'
import { PE_CURRICULUM } from './engines/pe/inpact_pe_index'
import { SEC_CURRICULUM } from './engines/sec/inpact_sec_index'
import { EL_CURRICULUM } from './engines/el/inpact_el_index'
import { FE_CURRICULUM } from './engines/fe/inpact_fe_index'
import INPACTEngineSD01 from './engines/sd/inpact_sd01_engine'
import INPACTEngineSD02 from './engines/sd/inpact_sd02_engine'
import INPACTEngineSD03 from './engines/sd/inpact_sd03_engine'
import INPACTEngineSD04 from './engines/sd/inpact_sd04_engine'
import INPACTEngineSD05 from './engines/sd/inpact_sd05_engine'
import INPACTEngineSD06 from './engines/sd/inpact_sd06_engine'
import INPACTEngineSD07 from './engines/sd/inpact_sd07_engine'
import INPACTEngineSD08 from './engines/sd/inpact_sd08_engine'
import INPACTEngineSD09 from './engines/sd/inpact_sd09_engine'
import INPACTEngineSD10 from './engines/sd/inpact_sd10_engine'
import INPACTEngineSD11 from './engines/sd/inpact_sd11_engine'
import INPACTEngineSD12 from './engines/sd/inpact_sd12_engine'
import INPACTEngineSD13 from './engines/sd/inpact_sd13_engine'
import INPACTEngineSD14 from './engines/sd/inpact_sd14_engine'
import INPACTEngineSD15 from './engines/sd/inpact_sd15_engine'
import INPACTEnginePE01 from './engines/pe/inpact_pe01_engine'
import INPACTEnginePE02 from './engines/pe/inpact_pe02_engine'
import INPACTEnginePE03 from './engines/pe/inpact_pe03_engine'
import INPACTEnginePE04 from './engines/pe/inpact_pe04_engine'
import INPACTEnginePE05 from './engines/pe/inpact_pe05_engine'
import INPACTEnginePE06 from './engines/pe/inpact_pe06_engine'
import INPACTEnginePE07 from './engines/pe/inpact_pe07_engine'
import INPACTEnginePE08 from './engines/pe/inpact_pe08_engine'
import INPACTEnginePE09 from './engines/pe/inpact_pe09_engine'
import INPACTEnginePE10 from './engines/pe/inpact_pe10_engine'
import INPACTEnginePE11 from './engines/pe/inpact_pe11_engine'
import INPACTEnginePE12 from './engines/pe/inpact_pe12_engine'
import INPACTEngineSEC01 from './engines/sec/inpact_sec01_engine'
import INPACTEngineSEC02 from './engines/sec/inpact_sec02_engine'
import INPACTEngineSEC03 from './engines/sec/inpact_sec03_engine'
import INPACTEngineSEC04 from './engines/sec/inpact_sec04_engine'
import INPACTEngineSEC05 from './engines/sec/inpact_sec05_engine'
import INPACTEngineSEC06 from './engines/sec/inpact_sec06_engine'
import INPACTEngineEL01 from './engines/el/inpact_el01_engine'
import INPACTEngineEL02 from './engines/el/inpact_el02_engine'
import INPACTEngineEL03 from './engines/el/inpact_el03_engine'
import INPACTEngineEL04 from './engines/el/inpact_el04_engine'
import INPACTEngineEL05 from './engines/el/inpact_el05_engine'
import INPACTEngineEL06 from './engines/el/inpact_el06_engine'
import INPACTEngineEL07 from './engines/el/inpact_el07_engine'
import INPACTEngineEL08 from './engines/el/inpact_el08_engine'
import INPACTEngineEL09 from './engines/el/inpact_el09_engine'
import INPACTEngineEL10 from './engines/el/inpact_el10_engine'
import INPACTEngineFE01 from './engines/fe/inpact_fe01_engine'
import INPACTEngineFE02 from './engines/fe/inpact_fe02_engine'
import INPACTEngineFE03 from './engines/fe/inpact_fe03_engine'
import INPACTEngineFE04 from './engines/fe/inpact_fe04_engine'
import INPACTEngineFE05 from './engines/fe/inpact_fe05_engine'
import INPACTEngineFE06 from './engines/fe/inpact_fe06_engine'
import INPACTEngineFE07 from './engines/fe/inpact_fe07_engine'
import INPACTEngineFE08 from './engines/fe/inpact_fe08_engine'
import INPACTEngineFE09 from './engines/fe/inpact_fe09_engine'
import INPACTEngineFE10 from './engines/fe/inpact_fe10_engine'
import INPACTEngineJSF11 from './engines/JS/inpact_jsf11_engine'
import INPACTEngineJSB01 from './engines/JS/inpact_jsb01_engine'
import INPACTEngineJSB02 from './engines/JS/inpact_jsb02_engine'
import INPACTEngineJSB03 from './engines/JS/inpact_jsb03_engine'
import INPACTEngineJSB04 from './engines/JS/inpact_jsb04_engine'
import INPACTEngineJSB05 from './engines/JS/inpact_jsb05_engine'
import INPACTEngineJSB06 from './engines/JS/inpact_jsb06_engine'
import INPACTEngineJSC01 from './engines/JS/inpact_jsc01_engine'
import INPACTEngineJSC02 from './engines/JS/inpact_jsc02_engine'
import INPACTEngineJSC03 from './engines/JS/inpact_jsc03_engine'
import INPACTEngineJSC04 from './engines/JS/inpact_jsc04_engine'
import INPACTEngineJSC05 from './engines/JS/inpact_jsc05_engine'
import INPACTEngineJSD01 from './engines/JS/inpact_jsd01_engine'
import INPACTEngineP01 from './engines/react-js/inpact_p01_engine'
import INPACTEngineP02 from './engines/react-js/inpact_p02_engine'
import INPACTEngineP03 from './engines/react-js/inpact_p03_engine'
import INPACTEngineP04 from './engines/react-js/inpact_p04_engine'
import INPACTEngineP05 from './engines/react-js/inpact_p05_engine'
import INPACTEngineP06 from './engines/react-js/inpact_p06_engine'
import INPACTEngineP07 from './engines/react-js/inpact_p07_engine'
import INPACTEngineP08 from './engines/react-js/inpact_p08_engine'
import INPACTEngineP09 from './engines/react-js/inpact_p09_engine'
import INPACTEngineP11 from './engines/react-js/inpact_p11_engine'
import INPACTEngineP12 from './engines/react-js/inpact_p12_engine'
import INPACTEngineP13 from './engines/react-js/inpact_p13_engine'
import INPACTEngineP14 from './engines/react-js/inpact_p14_engine'
import INPACTEngineP15 from './engines/react-js/inpact_p15_engine'
import INPACTEngineP18 from './engines/react-js/inpact_p18_engine'
import INPACTEngineP19 from './engines/react-js/inpact_p19_engine'
import INPACTEngineP20 from './engines/react-js/inpact_p20_engine'
import INPACTEngineP21 from './engines/react-js/inpact_p21_engine'
import INPACTEngineP22 from './engines/react-js/inpact_p22_engine'
import INPACTEngineP23 from './engines/react-js/inpact_p23_engine'
import INPACTEngineP24 from './engines/react-js/inpact_p24_engine'
import INPACTEngineP25 from './engines/react-js/inpact_p25_engine'
import INPACTEngineP26 from './engines/react-js/inpact_p26_engine'
import INPACTEngineP27 from './engines/react-js/inpact_p27_engine'
import INPACTEngineP28 from './engines/react-js/inpact_p28_engine'
import INPACTEngineP29 from './engines/react-js/inpact_p29_engine'
import INPACTEngineP30 from './engines/react-js/inpact_p30_engine'
import INPACTEngineTS01 from './engines/react-ts/inpact_ts01_engine'
import INPACTEngineTS02 from './engines/react-ts/inpact_ts02_engine'
import INPACTEngineTS03 from './engines/react-ts/inpact_ts03_engine'
import INPACTEngineTS04 from './engines/react-ts/inpact_ts04_engine'
import INPACTEngineTS05 from './engines/react-ts/inpact_ts05_engine'
import INPACTEngineTS06 from './engines/react-ts/inpact_ts06_engine'
import INPACTEngineTS07 from './engines/react-ts/inpact_ts07_engine'
import INPACTEngineTS08 from './engines/react-ts/inpact_ts08_engine'
import INPACTEngineTS09 from './engines/react-ts/inpact_ts09_engine'
import INPACTEngineTS10 from './engines/react-ts/inpact_ts10_engine'
import INPACTEngineTS11 from './engines/react-ts/inpact_ts11_engine'
import INPACTEngineTS12 from './engines/react-ts/inpact_ts12_engine'
import INPACTEngineTS13 from './engines/react-ts/inpact_ts13_engine'
import INPACTEngineTS14 from './engines/react-ts/inpact_ts14_engine'
import INPACTEngineTS15 from './engines/react-ts/inpact_ts15_engine'
import INPACTEngineTS16 from './engines/react-ts/inpact_ts16_engine'
import INPACTEngineTS17 from './engines/react-ts/inpact_ts17_engine'
import INPACTEngineTS18 from './engines/react-ts/inpact_ts18_engine'
import INPACTEngineTS19 from './engines/react-ts/inpact_ts19_engine'
import INPACTEngineTS20 from './engines/react-ts/inpact_ts20_engine'
import INPACTEngineTS21 from './engines/react-ts/inpact_ts21_engine'
import INPACTEngineTS22 from './engines/react-ts/inpact_ts22_engine'
import INPACTEngineTS23 from './engines/react-ts/inpact_ts23_engine'
import INPACTEngineTS24 from './engines/react-ts/inpact_ts24_engine'
import INPACTEngineTS25 from './engines/react-ts/inpact_ts25_engine'
import INPACTEngineTS26 from './engines/react-ts/inpact_ts26_engine'
import INPACTEngineTS27 from './engines/react-ts/inpact_ts27_engine'
import INPACTEngineTS28 from './engines/react-ts/inpact_ts28_engine'
import INPACTEngineTS29 from './engines/react-ts/inpact_ts29_engine'
import INPACTEngineTS30 from './engines/react-ts/inpact_ts30_engine'
import INPACTEngineP31 from './engines/react-js/inpact_p31_engine'
import INPACTEngineP32 from './engines/react-js/inpact_p32_engine'
import INPACTEngineP33 from './engines/react-js/inpact_p33_engine'
import INPACTEngineP34 from './engines/react-js/inpact_p34_engine'
import INPACTEngineP35 from './engines/react-js/inpact_p35_engine'
import INPACTEngineP36 from './engines/react-js/inpact_p36_engine'
import INPACTEngineP37 from './engines/react-js/inpact_p37_engine'
import INPACTEngineP38 from './engines/react-js/inpact_p38_engine'
import INPACTEngineP39 from './engines/react-js/inpact_p39_engine'
import INPACTEngineP40 from './engines/react-js/inpact_p40_engine'
import INPACTEngineP41 from './engines/react-js/inpact_p41_engine'
import INPACTEngineP42 from './engines/react-js/inpact_p42_engine'
import INPACTEngineP43 from './engines/react-js/inpact_p43_engine'
import INPACTEngineP44 from './engines/react-js/inpact_p44_engine'
import INPACTEngineP45 from './engines/react-js/inpact_p45_engine'
import INPACTEngineP46 from './engines/react-js/inpact_p46_engine'
import INPACTEngineP47 from './engines/react-js/inpact_p47_engine'
import INPACTEngineP48 from './engines/react-js/inpact_p48_engine'
import INPACTEngineP49 from './engines/react-js/inpact_p49_engine'
import INPACTEngineP50 from './engines/react-js/inpact_p50_engine'
import INPACTEngineP51 from './engines/react-js/inpact_p51_engine'
import INPACTEngineP52 from './engines/react-js/inpact_p52_engine'
import INPACTEngineP53 from './engines/react-js/inpact_p53_engine'
import INPACTEngineP54 from './engines/react-js/inpact_p54_engine'
import INPACTEngineP55 from './engines/react-js/inpact_p55_engine'
import INPACTEngineP56 from './engines/react-js/inpact_p56_engine'
import INPACTEngineP57 from './engines/react-js/inpact_p57_engine'
import INPACTEngineP58 from './engines/react-js/inpact_p58_engine'
import INPACTEngineP59 from './engines/react-js/inpact_p59_engine'
import INPACTEngineP60 from './engines/react-js/inpact_p60_engine'
import INPACTEngineP61 from './engines/react-js/inpact_p61_engine'
import INPACTEngineP62 from './engines/react-js/inpact_p62_engine'
import INPACTEngineP63 from './engines/react-js/inpact_p63_engine'
import INPACTEngineP64 from './engines/react-js/inpact_p64_engine'
import INPACTEngineP65 from './engines/react-js/inpact_p65_engine'
import INPACTEngineP66 from './engines/react-js/inpact_p66_engine'
import INPACTEngineP67 from './engines/react-js/inpact_p67_engine'
import INPACTEngineP68 from './engines/react-js/inpact_p68_engine'
import INPACTEngineP69 from './engines/react-js/inpact_p69_engine'
import INPACTEngineP70 from './engines/react-js/inpact_p70_engine'
import INPACTEngineP71 from './engines/react-js/inpact_p71_engine'
import INPACTEngineP72 from './engines/react-js/inpact_p72_engine'
import INPACTEngineP73 from './engines/react-js/inpact_p73_engine'
import INPACTEngineP74 from './engines/react-js/inpact_p74_engine'
import INPACTEngineP75 from './engines/react-js/inpact_p75_engine'
import INPACTEngineP76 from './engines/react-js/inpact_p76_engine'
import INPACTEngineP77 from './engines/react-js/inpact_p77_engine'
import INPACTEngineP78 from './engines/react-js/inpact_p78_engine'
import INPACTEngineP79 from './engines/react-js/inpact_p79_engine'
import INPACTEngineP80 from './engines/react-js/inpact_p80_engine'
import INPACTEngineP81 from './engines/react-js/inpact_p81_engine'
import INPACTEngineP82 from './engines/react-js/inpact_p82_engine'
import INPACTEngineP83 from './engines/react-js/inpact_p83_engine'
import INPACTEngineP84 from './engines/react-js/inpact_p84_engine'
import INPACTEngineP85 from './engines/react-js/inpact_p85_engine'
import INPACTEngineP86 from './engines/react-js/inpact_p86_engine'
import INPACTEngineP87 from './engines/react-js/inpact_p87_engine'
import INPACTEngineP89 from './engines/react-js/inpact_p89_engine'
import INPACTEngineP90 from './engines/react-js/inpact_p90_engine'
import INPACTEngineP91 from './engines/react-js/inpact_p91_engine'
import INPACTEngineP92 from './engines/react-js/inpact_p92_engine'
import INPACTEngineP93 from './engines/react-js/inpact_p93_engine'
import INPACTEngineP94 from './engines/react-js/inpact_p94_engine'
import INPACTEngineP95 from './engines/react-js/inpact_p95_engine'
import INPACTEngineP96 from './engines/react-js/inpact_p96_engine'
import INPACTEngineP97 from './engines/react-js/inpact_p97_engine'
import INPACTEngineP98 from './engines/react-js/inpact_p98_engine'
import INPACTEngineP99 from './engines/react-js/inpact_p99_engine'
import INPACTEngineP100 from './engines/react-js/inpact_p100_engine'
import INPACTEngineP126 from './engines/react-js/inpact_p126_engine'
import INPACTEngineP127 from './engines/react-js/inpact_p127_engine'
import INPACTEngineTS120 from './engines/react-ts/inpact_ts120_engine'
import INPACTEngineTS121 from './engines/react-ts/inpact_ts121_engine'
import INPACTEngineTS122 from './engines/react-ts/inpact_ts122_engine'
import INPACTEngineTS123 from './engines/react-ts/inpact_ts123_engine'
import INPACTEngineTS124 from './engines/react-ts/inpact_ts124_engine'
import INPACTEngineTS125 from './engines/react-ts/inpact_ts125_engine'
import INPACTEngineTS126 from './engines/react-ts/inpact_ts126_engine'
import INPACTEngineTS127 from './engines/react-ts/inpact_ts127_engine'
import INPACTEngineTS128 from './engines/react-ts/inpact_ts128_engine'
import INPACTEngineTS129 from './engines/react-ts/inpact_ts129_engine'
import INPACTEngineTS130 from './engines/react-ts/inpact_ts130_engine'
import INPACTEngineTS131 from './engines/react-ts/inpact_ts131_engine'
import INPACTEngineTS132 from './engines/react-ts/inpact_ts132_engine'
import INPACTEngineTS133 from './engines/react-ts/inpact_ts133_engine'
import INPACTEngineTS134 from './engines/react-ts/inpact_ts134_engine'
import INPACTEngineTS135 from './engines/react-ts/inpact_ts135_engine'
import INPACTEngineTS136 from './engines/react-ts/inpact_ts136_engine'
import INPACTEngineTS137 from './engines/react-ts/inpact_ts137_engine'
import INPACTEngineTS138 from './engines/react-ts/inpact_ts138_engine'
import INPACTEngineTS139 from './engines/react-ts/inpact_ts139_engine'
import INPACTEngineTS140 from './engines/react-ts/inpact_ts140_engine'
import INPACTEngineTS141 from './engines/react-ts/inpact_ts141_engine'
import INPACTEngineTS142 from './engines/react-ts/inpact_ts142_engine'
import INPACTEngineTS143 from './engines/react-ts/inpact_ts143_engine'
import INPACTEngineTS144 from './engines/react-ts/inpact_ts144_engine'
import INPACTEngineTS145 from './engines/react-ts/inpact_ts145_engine'
import INPACTEngineTS146 from './engines/react-ts/inpact_ts146_engine'
import INPACTEngineTS147 from './engines/react-ts/inpact_ts147_engine'
import INPACTEngineTS148 from './engines/react-ts/inpact_ts148_engine'
import INPACTEngineTS149 from './engines/react-ts/inpact_ts149_engine'
import INPACTEngineTS150 from './engines/react-ts/inpact_ts150_engine'
import INPACTEngineTS101 from './engines/react-ts/inpact_ts101_engine'
import INPACTEngineTS102 from './engines/react-ts/inpact_ts102_engine'
import INPACTEngineTS103 from './engines/react-ts/inpact_ts103_engine'
import INPACTEngineTS104 from './engines/react-ts/inpact_ts104_engine'
import INPACTEngineTS105 from './engines/react-ts/inpact_ts105_engine'
import INPACTEngineTS106 from './engines/react-ts/inpact_ts106_engine'
import INPACTEngineTS107 from './engines/react-ts/inpact_ts107_engine'
import INPACTEngineTS108 from './engines/react-ts/inpact_ts108_engine'
import INPACTEngineTS109 from './engines/react-ts/inpact_ts109_engine'
import INPACTEngineTS110 from './engines/react-ts/inpact_ts110_engine'
import INPACTEngineTS111 from './engines/react-ts/inpact_ts111_engine'
import INPACTEngineTS112 from './engines/react-ts/inpact_ts112_engine'
import INPACTEngineTS113 from './engines/react-ts/inpact_ts113_engine'
import INPACTEngineTS114 from './engines/react-ts/inpact_ts114_engine'
import INPACTEngineTS115 from './engines/react-ts/inpact_ts115_engine'
import INPACTEngineTS116 from './engines/react-ts/inpact_ts116_engine'
import INPACTEngineTS117 from './engines/react-ts/inpact_ts117_engine'
import INPACTEngineTS118 from './engines/react-ts/inpact_ts118_engine'
import INPACTEngineTS119 from './engines/react-ts/inpact_ts119_engine'
import INPACTEngineTS31 from './engines/react-ts/inpact_ts31_engine'
import INPACTEngineTS32 from './engines/react-ts/inpact_ts32_engine'
import INPACTEngineTS33 from './engines/react-ts/inpact_ts33_engine'
import INPACTEngineTS34 from './engines/react-ts/inpact_ts34_engine'
import INPACTEngineTS35 from './engines/react-ts/inpact_ts35_engine'
import INPACTEngineTS36 from './engines/react-ts/inpact_ts36_engine'
import INPACTEngineTS37 from './engines/react-ts/inpact_ts37_engine'
import INPACTEngineTS38 from './engines/react-ts/inpact_ts38_engine'
import INPACTEngineTS39 from './engines/react-ts/inpact_ts39_engine'
import INPACTEngineTS40 from './engines/react-ts/inpact_ts40_engine'
import INPACTEngineTS41 from './engines/react-ts/inpact_ts41_engine'
import INPACTEngineTS42 from './engines/react-ts/inpact_ts42_engine'
import INPACTEngineTS43 from './engines/react-ts/inpact_ts43_engine'
import INPACTEngineTS44 from './engines/react-ts/inpact_ts44_engine'
import INPACTEngineTS45 from './engines/react-ts/inpact_ts45_engine'
import INPACTEngineTS46 from './engines/react-ts/inpact_ts46_engine'
import INPACTEngineTS47 from './engines/react-ts/inpact_ts47_engine'
import INPACTEngineTS48 from './engines/react-ts/inpact_ts48_engine'
import INPACTEngineTS49 from './engines/react-ts/inpact_ts49_engine'
import INPACTEngineTS50 from './engines/react-ts/inpact_ts50_engine'
import INPACTEngineTS51 from './engines/react-ts/inpact_ts51_engine'
import INPACTEngineTS52 from './engines/react-ts/inpact_ts52_engine'
import INPACTEngineTS53 from './engines/react-ts/inpact_ts53_engine'
import INPACTEngineTS54 from './engines/react-ts/inpact_ts54_engine'
import INPACTEngineTS55 from './engines/react-ts/inpact_ts55_engine'
import INPACTEngineTS56 from './engines/react-ts/inpact_ts56_engine'
import INPACTEngineTS57 from './engines/react-ts/inpact_ts57_engine'
import INPACTEngineTS58 from './engines/react-ts/inpact_ts58_engine'
import INPACTEngineTS59 from './engines/react-ts/inpact_ts59_engine'
import INPACTEngineTS60 from './engines/react-ts/inpact_ts60_engine'
import INPACTEngineTS61 from './engines/react-ts/inpact_ts61_engine'
import INPACTEngineTS62 from './engines/react-ts/inpact_ts62_engine'
import INPACTEngineTS63 from './engines/react-ts/inpact_ts63_engine'
import INPACTEngineTS64 from './engines/react-ts/inpact_ts64_engine'
import INPACTEngineTS65 from './engines/react-ts/inpact_ts65_engine'
import INPACTEngineTS66 from './engines/react-ts/inpact_ts66_engine'
import INPACTEngineTS67 from './engines/react-ts/inpact_ts67_engine'
import INPACTEngineTS68 from './engines/react-ts/inpact_ts68_engine'
import INPACTEngineTS69 from './engines/react-ts/inpact_ts69_engine'
import INPACTEngineTS70 from './engines/react-ts/inpact_ts70_engine'
import INPACTEngineTS71 from './engines/react-ts/inpact_ts71_engine'
import INPACTEngineTS72 from './engines/react-ts/inpact_ts72_engine'
import INPACTEngineTS73 from './engines/react-ts/inpact_ts73_engine'
import INPACTEngineTS74 from './engines/react-ts/inpact_ts74_engine'
import INPACTEngineTS75 from './engines/react-ts/inpact_ts75_engine'
import INPACTEngineTS76 from './engines/react-ts/inpact_ts76_engine'
import INPACTEngineTS77 from './engines/react-ts/inpact_ts77_engine'
import INPACTEngineTS78 from './engines/react-ts/inpact_ts78_engine'
import INPACTEngineTS79 from './engines/react-ts/inpact_ts79_engine'
import INPACTEngineTS80 from './engines/react-ts/inpact_ts80_engine'
import INPACTEngineTS81 from './engines/react-ts/inpact_ts81_engine'
import INPACTEngineTS82 from './engines/react-ts/inpact_ts82_engine'
import INPACTEngineTS83 from './engines/react-ts/inpact_ts83_engine'
import INPACTEngineTS84 from './engines/react-ts/inpact_ts84_engine'
import INPACTEngineTS85 from './engines/react-ts/inpact_ts85_engine'
import INPACTEngineTS86 from './engines/react-ts/inpact_ts86_engine'
import INPACTEngineTS87 from './engines/react-ts/inpact_ts87_engine'
import INPACTEngineTS88 from './engines/react-ts/inpact_ts88_engine'
import INPACTEngineTS89 from './engines/react-ts/inpact_ts89_engine'
import INPACTEngineTS90 from './engines/react-ts/inpact_ts90_engine'
import INPACTEngineTS91 from './engines/react-ts/inpact_ts91_engine'
import INPACTEngineTS92 from './engines/react-ts/inpact_ts92_engine'
import INPACTEngineTS93 from './engines/react-ts/inpact_ts93_engine'
import INPACTEngineTS94 from './engines/react-ts/inpact_ts94_engine'
import INPACTEngineTS95 from './engines/react-ts/inpact_ts95_engine'
import INPACTEngineTS96 from './engines/react-ts/inpact_ts96_engine'
import INPACTEngineTS97 from './engines/react-ts/inpact_ts97_engine'
import INPACTEngineTS98 from './engines/react-ts/inpact_ts98_engine'
import INPACTEngineTS99 from './engines/react-ts/inpact_ts99_engine'
import INPACTEngineTS100 from './engines/react-ts/inpact_ts100_engine'
import { ENGINES_VUE } from './engines/vue/inpact_vue_index'
import INPACTEngineAngularA01 from './engines/angular/angular_a01_components'
import INPACTEngineAngularA02 from './engines/angular/angular_a02_data_binding'
import INPACTEngineAngularA03 from './engines/angular/angular_a03_services_di'
import INPACTEngineAngularA04 from './engines/angular/angular_a04_rxjs'
import INPACTEngineAngularA05 from './engines/angular/angular_a05_ngrx'
import INPACTEngineAngularA06 from './engines/angular/angular_a06_routing'
import INPACTEngineAngularA07 from './engines/angular/angular_a07_change_detection'
import INPACTEngineAngularA08 from './engines/angular/angular_a08_module_federation'
import INPACTEngineAngularA09 from './engines/angular/angular_a09_pipes'
import INPACTEngineAngularQB01 from './engines/angular/angular_qb01_project_scaffold'
import INPACTEngineAngularQB02 from './engines/angular/angular_qb02_app_shell_navigation'
import INPACTEngineAngularQB03 from './engines/angular/angular_qb03_orders_list_page'
import INPACTEngineAngularQB04 from './engines/angular/angular_qb04_capacitor_gps'
import INPACTEngineAngularQB05 from './engines/angular/angular_qb05_push_notifications'
import { ENGINES_ANGULAR_CURRICULUM } from './engines/angular/angular_curriculum_index'
import INPACTEngineC01 from './engines/css/inpact_c01_engine'
import INPACTEngineC02 from './engines/css/inpact_c02_engine'
import INPACTEngineC03 from './engines/css/inpact_c03_engine'
import INPACTEngineC04 from './engines/css/inpact_c04_engine'
import INPACTEngineC05 from './engines/css/inpact_c05_engine'
import INPACTEngineC06 from './engines/css/inpact_c06_engine'
import INPACTEngineC07 from './engines/css/inpact_c07_engine'
import INPACTEngineC08 from './engines/css/inpact_c08_engine'
import INPACTEngineC09 from './engines/css/inpact_c09_engine'
import INPACTEngineC10 from './engines/css/inpact_c10_engine'
import INPACTEngineC11 from './engines/css/inpact_c11_engine'
import INPACTEngineC12 from './engines/css/inpact_c12_engine'
import INPACTEngineC13 from './engines/css/inpact_c13_engine'
import INPACTEngineC14 from './engines/css/inpact_c14_engine'
import INPACTEngineC15 from './engines/css/inpact_c15_engine'
import INPACTEngineC16 from './engines/css/inpact_c16_engine'
import INPACTEngineC17 from './engines/css/inpact_c17_engine'
import INPACTEngineC18 from './engines/css/inpact_c18_engine'
import INPACTEngineC19 from './engines/css/inpact_c19_engine'
import INPACTEngineC20 from './engines/css/inpact_c20_engine'
import INPACTEngineC21 from './engines/css/inpact_c21_engine'
import INPACTEngineC22 from './engines/css/inpact_c22_engine'
import INPACTEngineC23 from './engines/css/inpact_c23_engine'
import INPACTEngineC24 from './engines/css/inpact_c24_engine'
import INPACTEngineC25 from './engines/css/inpact_c25_engine'
import INPACTEngineC26 from './engines/css/inpact_c26_engine'
import INPACTEngineC27 from './engines/css/inpact_c27_engine'
import INPACTEngineC28 from './engines/css/inpact_c28_engine'
import INPACTEngineC29 from './engines/css/inpact_c29_engine'
import INPACTEngineC30 from './engines/css/inpact_c30_engine'
import INPACTEngineC31 from './engines/css/inpact_c31_engine'
import INPACTEngineC32 from './engines/css/inpact_c32_engine'
import INPACTEngineC33 from './engines/css/inpact_c33_engine'
import INPACTEngineC34 from './engines/css/inpact_c34_engine'
import INPACTEngineC35 from './engines/css/inpact_c35_engine'
import INPACTEngineC36 from './engines/css/inpact_c36_engine'
import INPACTEngineC37 from './engines/css/inpact_c37_engine'
import INPACTEngineC38 from './engines/css/inpact_c38_engine'
import INPACTEngineC39 from './engines/css/inpact_c39_engine'
import INPACTEngineC40 from './engines/css/inpact_c40_engine'
import INPACTEngineC41 from './engines/css/inpact_c41_engine'
import INPACTEngineC42 from './engines/css/inpact_c42_engine'
import INPACTEngineC43 from './engines/css/inpact_c43_engine'
import INPACTEngineC44 from './engines/css/inpact_c44_engine'
import INPACTEngineC45 from './engines/css/inpact_c45_engine'
import INPACTEngineC46 from './engines/css/inpact_c46_engine'
import INPACTEngineC47 from './engines/css/inpact_c47_engine'
import INPACTEngineC48 from './engines/css/inpact_c48_engine'
import INPACTEngineC49 from './engines/css/inpact_c49_engine'
import INPACTEngineC50 from './engines/css/inpact_c50_engine'
import INPACTEngineC51 from './engines/css/inpact_c51_engine'
import INPACTEngineC52 from './engines/css/inpact_c52_engine'
import INPACTEngineC53 from './engines/css/inpact_c53_engine'
import INPACTEngineC54 from './engines/css/inpact_c54_engine'
import INPACTEngineC55 from './engines/css/inpact_c55_engine'
import INPACTEngineC56 from './engines/css/inpact_c56_engine'
import INPACTEngineC57 from './engines/css/inpact_c57_engine'
import INPACTEngineC58 from './engines/css/inpact_c58_engine'
import INPACTEngineC59 from './engines/css/inpact_c59_engine'
import INPACTEngineC60 from './engines/css/inpact_c60_engine'
import INPACTEngineC61 from './engines/css/inpact_c61_engine'
import INPACTEngineC62 from './engines/css/inpact_c62_engine'
import INPACTEngineC63 from './engines/css/inpact_c63_engine'
import INPACTEngineC64 from './engines/css/inpact_c64_engine'
import INPACTEngineC65 from './engines/css/inpact_c65_engine'
import INPACTEngineC66 from './engines/css/inpact_c66_engine'
import INPACTEngineC67 from './engines/css/inpact_c67_engine'
import INPACTEngineC68 from './engines/css/inpact_c68_engine'
import INPACTEngineC69 from './engines/css/inpact_c69_engine'
import INPACTEngineC70 from './engines/css/inpact_c70_engine'
import INPACTEngineC71 from './engines/css/inpact_c71_engine'
import INPACTEngineC72 from './engines/css/inpact_c72_engine'
import INPACTEngineC73 from './engines/css/inpact_c73_engine'
import INPACTEngineC74 from './engines/css/inpact_c74_engine'
import INPACTEngineC75 from './engines/css/inpact_c75_engine'
import INPACTEngineC76 from './engines/css/inpact_c76_engine'
import INPACTEngineC77 from './engines/css/inpact_c77_engine'
import INPACTEngineC78 from './engines/css/inpact_c78_engine'
import INPACTEngineC79 from './engines/css/inpact_c79_engine'
import INPACTEngineC80 from './engines/css/inpact_c80_engine'
import INPACTEngineC81 from './engines/css/inpact_c81_engine'
import INPACTEngineC82 from './engines/css/inpact_c82_engine'
import INPACTEngineC83 from './engines/css/inpact_c83_engine'
import INPACTEngineC84 from './engines/css/inpact_c84_engine'
import INPACTEngineC85 from './engines/css/inpact_c85_engine'
import INPACTEngineC86 from './engines/css/inpact_c86_engine'
import INPACTEngineC87 from './engines/css/inpact_c87_engine'
import INPACTEngineC88 from './engines/css/inpact_c88_engine'
import INPACTEngineC89 from './engines/css/inpact_c89_engine'
import INPACTEngineC90 from './engines/css/inpact_c90_engine'
import INPACTEngineC91 from './engines/css/inpact_c91_engine'
import INPACTEngineC92 from './engines/css/inpact_c92_engine'
import INPACTEngineC93 from './engines/css/inpact_c93_engine'
import INPACTEngineC94 from './engines/css/inpact_c94_engine'
import INPACTEngineC95 from './engines/css/inpact_c95_engine'
import INPACTEngineC96 from './engines/css/inpact_c96_engine'
import INPACTEngineC97 from './engines/css/inpact_c97_engine'
import INPACTEngineC98 from './engines/css/inpact_c98_engine'
import INPACTEngineC99 from './engines/css/inpact_c99_engine'
import INPACTEngineC100 from './engines/css/inpact_c100_engine'
import { CSS_CURRICULUM } from './engines/css/inpact_css_index'

const ENGINES = [
  INPACTEngineP01,
  INPACTEngineP02,
  INPACTEngineP03,
  INPACTEngineP04,
  INPACTEngineP05,
  INPACTEngineP06,
  INPACTEngineP07,
  INPACTEngineP08,
  INPACTEngineP09,
  INPACTEngineP11,
  INPACTEngineP12,
  INPACTEngineP13,
  INPACTEngineP14,
  INPACTEngineP15,
  INPACTEngineP18,
  INPACTEngineP19,
  INPACTEngineP20,
  INPACTEngineP21,
  INPACTEngineP22,
  INPACTEngineP23,
  INPACTEngineP24,
  INPACTEngineP25,
  INPACTEngineP26,
  INPACTEngineP27,
  INPACTEngineP28,
  INPACTEngineP29,
  INPACTEngineP30,
  INPACTEngineP31,
  INPACTEngineP32,
  INPACTEngineP33,
  INPACTEngineP34,
  INPACTEngineP35,
  INPACTEngineP36,
  INPACTEngineP37,
  INPACTEngineP38,
  INPACTEngineP39,
  INPACTEngineP40,
  INPACTEngineP41,
  INPACTEngineP42,
  INPACTEngineP43,
  INPACTEngineP44,
  INPACTEngineP45,
  INPACTEngineP46,
  INPACTEngineP47,
  INPACTEngineP48,
  INPACTEngineP49,
  INPACTEngineP50,
  INPACTEngineP51,
  INPACTEngineP52,
  INPACTEngineP53,
  INPACTEngineP54,
  INPACTEngineP55,
  INPACTEngineP56,
  INPACTEngineP57,
  INPACTEngineP58,
  INPACTEngineP59,
  INPACTEngineP60,
  INPACTEngineP61,
  INPACTEngineP62,
  INPACTEngineP63,
  INPACTEngineP64,
  INPACTEngineP65,
  INPACTEngineP66,
  INPACTEngineP67,
  INPACTEngineP68,
  INPACTEngineP69,
  INPACTEngineP70,
  INPACTEngineP71,
  INPACTEngineP72,
  INPACTEngineP73,
  INPACTEngineP74,
  INPACTEngineP75,
  INPACTEngineP76,
  INPACTEngineP77,
  INPACTEngineP78,
  INPACTEngineP79,
  INPACTEngineP80,
  INPACTEngineP81,
  INPACTEngineP82,
  INPACTEngineP83,
  INPACTEngineP84,
  INPACTEngineP85,
  INPACTEngineP86,
  INPACTEngineP87,
  INPACTEngineP89,
  INPACTEngineP90,
  INPACTEngineP91,
  INPACTEngineP92,
  INPACTEngineP93,
  INPACTEngineP94,
  INPACTEngineP95,
  INPACTEngineP96,
  INPACTEngineP97,
  INPACTEngineP98,
  INPACTEngineP99,
  INPACTEngineP100,
  INPACTEngineP126,
  INPACTEngineP127,
]

// React-TS: `ENGINES_TS_BASE` is legacy TS01…TS150 order; `ENGINES_TS_REORDER` matches `LESSON_LIST` in reactTsCurriculum.js (151 slots; deep dive reuses TS14).
const ENGINES_TS_BASE = [
  INPACTEngineTS01,
  INPACTEngineTS02,
  INPACTEngineTS03,
  INPACTEngineTS04,
  INPACTEngineTS05,
  INPACTEngineTS06,
  INPACTEngineTS07,
  INPACTEngineTS08,
  INPACTEngineTS09,
  INPACTEngineTS10,
  INPACTEngineTS11,
  INPACTEngineTS12,
  INPACTEngineTS13,
  INPACTEngineTS14,
  INPACTEngineTS15,
  INPACTEngineTS16,
  INPACTEngineTS17,
  INPACTEngineTS18,
  INPACTEngineTS19,
  INPACTEngineTS20,
  INPACTEngineTS21,
  INPACTEngineTS22,
  INPACTEngineTS23,
  INPACTEngineTS24,
  INPACTEngineTS25,
  INPACTEngineTS26,
  INPACTEngineTS27,
  INPACTEngineTS28,
  INPACTEngineTS29,
  INPACTEngineTS30,
  INPACTEngineTS31,
  INPACTEngineTS32,
  INPACTEngineTS33,
  INPACTEngineTS34,
  INPACTEngineTS35,
  INPACTEngineTS36,
  INPACTEngineTS37,
  INPACTEngineTS38,
  INPACTEngineTS39,
  INPACTEngineTS40,
  INPACTEngineTS41,
  INPACTEngineTS42,
  INPACTEngineTS43,
  INPACTEngineTS44,
  INPACTEngineTS45,
  INPACTEngineTS46,
  INPACTEngineTS47,
  INPACTEngineTS48,
  INPACTEngineTS49,
  INPACTEngineTS50,
  INPACTEngineTS51,
  INPACTEngineTS52,
  INPACTEngineTS53,
  INPACTEngineTS54,
  INPACTEngineTS55,
  INPACTEngineTS56,
  INPACTEngineTS57,
  INPACTEngineTS58,
  INPACTEngineTS59,
  INPACTEngineTS60,
  INPACTEngineTS61,
  INPACTEngineTS62,
  INPACTEngineTS63,
  INPACTEngineTS64,
  INPACTEngineTS65,
  INPACTEngineTS66,
  INPACTEngineTS67,
  INPACTEngineTS68,
  INPACTEngineTS69,
  INPACTEngineTS70,
  INPACTEngineTS71,
  INPACTEngineTS72,
  INPACTEngineTS73,
  INPACTEngineTS74,
  INPACTEngineTS75,
  INPACTEngineTS76,
  INPACTEngineTS77,
  INPACTEngineTS78,
  INPACTEngineTS79,
  INPACTEngineTS80,
  INPACTEngineTS81,
  INPACTEngineTS82,
  INPACTEngineTS83,
  INPACTEngineTS84,
  INPACTEngineTS85,
  INPACTEngineTS86,
  INPACTEngineTS87,
  INPACTEngineTS88,
  INPACTEngineTS89,
  INPACTEngineTS90,
  INPACTEngineTS91,
  INPACTEngineTS92,
  INPACTEngineTS93,
  INPACTEngineTS94,
  INPACTEngineTS95,
  INPACTEngineTS96,
  INPACTEngineTS97,
  INPACTEngineTS98,
  INPACTEngineTS99,
  INPACTEngineTS100,
  INPACTEngineTS101,
  INPACTEngineTS102,
  INPACTEngineTS103,
  INPACTEngineTS104,
  INPACTEngineTS105,
  INPACTEngineTS106,
  INPACTEngineTS107,
  INPACTEngineTS108,
  INPACTEngineTS109,
  INPACTEngineTS110,
  INPACTEngineTS111,
  INPACTEngineTS112,
  INPACTEngineTS113,
  INPACTEngineTS114,
  INPACTEngineTS115,
  INPACTEngineTS116,
  INPACTEngineTS117,
  INPACTEngineTS118,
  INPACTEngineTS119,
  INPACTEngineTS120,
  INPACTEngineTS121,
  INPACTEngineTS122,
  INPACTEngineTS123,
  INPACTEngineTS124,
  INPACTEngineTS125,
  INPACTEngineTS126,
  INPACTEngineTS127,
  INPACTEngineTS128,
  INPACTEngineTS129,
  INPACTEngineTS130,
  INPACTEngineTS131,
  INPACTEngineTS132,
  INPACTEngineTS133,
  INPACTEngineTS134,
  INPACTEngineTS135,
  INPACTEngineTS136,
  INPACTEngineTS137,
  INPACTEngineTS138,
  INPACTEngineTS139,
  INPACTEngineTS140,
  INPACTEngineTS141,
  INPACTEngineTS142,
  INPACTEngineTS143,
  INPACTEngineTS144,
  INPACTEngineTS145,
  INPACTEngineTS146,
  INPACTEngineTS147,
  INPACTEngineTS148,
  INPACTEngineTS149,
  INPACTEngineTS150,
]

const ENGINES_TS_REORDER = [
  1, 2, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 4, 87, 82, 83, 84, 85, 86, 80, 81, 88, 89, 90, 91, 93, 94, 95, 92, 96, 97, 98, 99, 100, 101, 102, 104, 105, 106, 109, 103, 107, 108, 110, 111, 112, 113, 114, 115, 116, 5, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 6, 3, 14, 127, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150,
]

const ENGINES_TS = ENGINES_TS_REORDER.map((legacyLessonNum) => ENGINES_TS_BASE[legacyLessonNum - 1])

// TypeScript Fundamentals: 10 language-first lessons (no React)
const ENGINES_TSF = [
  INPACTEngineTSF01,
  INPACTEngineTSF02,
  INPACTEngineTSF03,
  INPACTEngineTSF04,
  INPACTEngineTSF05,
  INPACTEngineTSF06,
  INPACTEngineTSF07,
  INPACTEngineTSF08,
  INPACTEngineTSF09,
  INPACTEngineTSF10,
]

// JavaScript Fundamentals: 10 language-first lessons (no React)
const ENGINES_JSF = [
  INPACTEngineJSF01,
  INPACTEngineJSF02,
  INPACTEngineJSF03,
  INPACTEngineJSF04,
  INPACTEngineJSF05,
  INPACTEngineJSF06,
  INPACTEngineJSF07,
  INPACTEngineJSF08,
  INPACTEngineJSF09,
  INPACTEngineJSF10,
  INPACTEngineJSF12,
  INPACTEngineJSF13,
  INPACTEngineJSF14,
  INPACTEngineJSF15,
]

// Node.js Fundamentals: 15 lessons (nodef01–nodef15)
const ENGINES_NODE = [
  INPACTEngineNODEF01,
  INPACTEngineNODEF02,
  INPACTEngineNODEF03,
  INPACTEngineNODEF04,
  INPACTEngineNODEF05,
  INPACTEngineNODEF06,
  INPACTEngineNODEF07,
  INPACTEngineNODEF08,
  INPACTEngineNODEF09,
  INPACTEngineNODEF10,
  INPACTEngineNODEF11,
  INPACTEngineNODEF12,
  INPACTEngineNODEF13,
  INPACTEngineNODEF14,
  INPACTEngineNODEF15,
]

// Express.js: 12 lessons
const ENGINES_EXPRESS = [
  INPACTEngineEXPF01, INPACTEngineEXPF02, INPACTEngineEXPF03, INPACTEngineEXPF04,
  INPACTEngineEXPF05, INPACTEngineEXPF06, INPACTEngineEXPF07, INPACTEngineEXPF08,
  INPACTEngineEXPF09, INPACTEngineEXPF10, INPACTEngineEXPF11, INPACTEngineEXPF12,
]

// Python: 12 lessons
const ENGINES_PYTHON = [
  INPACTEnginePYF01, INPACTEnginePYF02, INPACTEnginePYF03, INPACTEnginePYF04,
  INPACTEnginePYF05, INPACTEnginePYF06, INPACTEnginePYF07, INPACTEnginePYF08,
  INPACTEnginePYF09, INPACTEnginePYF10, INPACTEnginePYF11, INPACTEnginePYF12,
]

// New-set: SD (15), PE (12), SEC (6), EL (10), FE (10)
const ENGINES_SD = [ INPACTEngineSD01, INPACTEngineSD02, INPACTEngineSD03, INPACTEngineSD04, INPACTEngineSD05, INPACTEngineSD06, INPACTEngineSD07, INPACTEngineSD08, INPACTEngineSD09, INPACTEngineSD10, INPACTEngineSD11, INPACTEngineSD12, INPACTEngineSD13, INPACTEngineSD14, INPACTEngineSD15 ]
const ENGINES_PE = [ INPACTEnginePE01, INPACTEnginePE02, INPACTEnginePE03, INPACTEnginePE04, INPACTEnginePE05, INPACTEnginePE06, INPACTEnginePE07, INPACTEnginePE08, INPACTEnginePE09, INPACTEnginePE10, INPACTEnginePE11, INPACTEnginePE12 ]
const ENGINES_SEC = [ INPACTEngineSEC01, INPACTEngineSEC02, INPACTEngineSEC03, INPACTEngineSEC04, INPACTEngineSEC05, INPACTEngineSEC06 ]
const ENGINES_EL = [ INPACTEngineEL01, INPACTEngineEL02, INPACTEngineEL03, INPACTEngineEL04, INPACTEngineEL05, INPACTEngineEL06, INPACTEngineEL07, INPACTEngineEL08, INPACTEngineEL09, INPACTEngineEL10 ]
const ENGINES_FE = [ INPACTEngineFE01, INPACTEngineFE02, INPACTEngineFE03, INPACTEngineFE04, INPACTEngineFE05, INPACTEngineFE06, INPACTEngineFE07, INPACTEngineFE08, INPACTEngineFE09, INPACTEngineFE10 ]

// JS Deep Dive: 13 lessons (jsf11, jsb01–06, jsc01–05, jsd01)
const ENGINES_JS = [
  INPACTEngineJSF11,
  INPACTEngineJSB01,
  INPACTEngineJSB02,
  INPACTEngineJSB03,
  INPACTEngineJSB04,
  INPACTEngineJSB05,
  INPACTEngineJSB06,
  INPACTEngineJSC01,
  INPACTEngineJSC02,
  INPACTEngineJSC03,
  INPACTEngineJSC04,
  INPACTEngineJSC05,
  INPACTEngineJSD01,
]

// CSS — Module 1: Foundations (C01–C04)
const ENGINES_CSS = [
  INPACTEngineC01,
  INPACTEngineC02,
  INPACTEngineC03,
  INPACTEngineC04,
  INPACTEngineC05,
  INPACTEngineC06,
  INPACTEngineC07,
  INPACTEngineC08,
  INPACTEngineC09,
  INPACTEngineC10,
  INPACTEngineC11,
  INPACTEngineC12,
  INPACTEngineC13,
  INPACTEngineC14,
  INPACTEngineC15,
  INPACTEngineC16,
  INPACTEngineC17,
  INPACTEngineC18,
  INPACTEngineC19,
  INPACTEngineC20,
  INPACTEngineC21,
  INPACTEngineC22,
  INPACTEngineC23,
  INPACTEngineC24,
  INPACTEngineC25,
  INPACTEngineC26,
  INPACTEngineC27,
  INPACTEngineC28,
  INPACTEngineC29,
  INPACTEngineC30,
  INPACTEngineC31,
  INPACTEngineC32,
  INPACTEngineC33,
  INPACTEngineC34,
  INPACTEngineC35,
  INPACTEngineC36,
  INPACTEngineC37,
  INPACTEngineC38,
  INPACTEngineC39,
  INPACTEngineC40,
  INPACTEngineC41,
  INPACTEngineC42,
  INPACTEngineC43,
  INPACTEngineC44,
  INPACTEngineC45,
  INPACTEngineC46,
  INPACTEngineC47,
  INPACTEngineC48,
  INPACTEngineC49,
  INPACTEngineC50,
  INPACTEngineC51,
  INPACTEngineC52,
  INPACTEngineC53,
  INPACTEngineC54,
  INPACTEngineC55,
  INPACTEngineC56,
  INPACTEngineC57,
  INPACTEngineC58,
  INPACTEngineC59,
  INPACTEngineC60,
  INPACTEngineC61,
  INPACTEngineC62,
  INPACTEngineC63,
  INPACTEngineC64,
  INPACTEngineC65,
  INPACTEngineC66,
  INPACTEngineC67,
  INPACTEngineC68,
  INPACTEngineC69,
  INPACTEngineC70,
  INPACTEngineC71,
  INPACTEngineC72,
  INPACTEngineC73,
  INPACTEngineC74,
  INPACTEngineC75,
  INPACTEngineC76,
  INPACTEngineC77,
  INPACTEngineC78,
  INPACTEngineC79,
  INPACTEngineC80,
  INPACTEngineC81,
  INPACTEngineC82,
  INPACTEngineC83,
  INPACTEngineC84,
  INPACTEngineC85,
  INPACTEngineC86,
  INPACTEngineC87,
  INPACTEngineC88,
  INPACTEngineC89,
  INPACTEngineC90,
  INPACTEngineC91,
  INPACTEngineC92,
  INPACTEngineC93,
  INPACTEngineC94,
  INPACTEngineC95,
  INPACTEngineC96,
  INPACTEngineC97,
  INPACTEngineC98,
  INPACTEngineC99,
  INPACTEngineC100,
]

const ALGO_AI_TRACKS = ['algo-js', 'algo-ts', 'algo-python', 'algo-java']

/** Match engine slot count to `LESSON_LIST.length` so landing indices align with routes (null = no static engine yet). */
function padEnginesToLessonCatalog(engines) {
  const n = LESSON_LIST.length
  if (!n || engines.length >= n) return engines
  return [...engines, ...Array(n - engines.length).fill(null)]
}

function getEngines(track, lessonListLength = 0) {
  if (track === 'mobile-angular' && lessonListLength > 0) {
    return Array(lessonListLength).fill(null)
  }
  if (ALGO_AI_TRACKS.includes(track)) {
    return Array(ALGO_AI_NAMES.length).fill(null)
  }
  if (track === 'js') return [...ENGINES_JSF, ...ENGINES_JS_INTERVIEW]
  if (track === 'ts') return [...ENGINES_TSF, ...ENGINES_TS_INTERVIEW]
  if (track === 'node') return [...ENGINES_NODE, ...ENGINES_NODE_INTERVIEW]
  if (track === 'express') return ENGINES_EXPRESS
  if (track === 'python') return ENGINES_PYTHON
  if (track === 'sd') return ENGINES_SD
  if (track === 'pe') return ENGINES_PE
  if (track === 'sec') return ENGINES_SEC
  if (track === 'el') return ENGINES_EL
  if (track === 'fe') return ENGINES_FE
  if (track === 'react-ts') return padEnginesToLessonCatalog(ENGINES_TS)
  if (track === 'angular') {
    const angularTotal = getLessonCount('angular', { reactListLength: LESSON_LIST.length })
    const staticAngularEngines = 14 + ENGINES_ANGULAR_CURRICULUM.length
    const pad = Math.max(0, angularTotal - staticAngularEngines)
    return [
      INPACTEngineAngularQB01,
      INPACTEngineAngularQB02,
      INPACTEngineAngularQB03,
      INPACTEngineAngularQB04,
      INPACTEngineAngularQB05,
      INPACTEngineAngularA01,
      INPACTEngineAngularA02,
      INPACTEngineAngularA03,
      INPACTEngineAngularA04,
      INPACTEngineAngularA05,
      INPACTEngineAngularA06,
      INPACTEngineAngularA07,
      INPACTEngineAngularA08,
      INPACTEngineAngularA09,
      ...ENGINES_ANGULAR_CURRICULUM,
      ...Array(pad).fill(null),
    ]
  }
  if (track === 'vue') return padEnginesToLessonCatalog(ENGINES_VUE)
  if (track === 'css') return ENGINES_CSS
  return padEnginesToLessonCatalog(ENGINES)
}

function getLessonList(track) {
  if (track === 'js') {
    const jsFund = JS_FUNDAMENTALS_CURRICULUM.map((c) => ({ title: c.title, shortName: c.shortName, why: c.why }))
    return [...jsFund, ...JS_INTERVIEW_CURRICULUM]
  }
  if (track === 'ts') {
    const tsFund = TS_FUNDAMENTALS_CURRICULUM.map((c) => ({ title: c.title, shortName: c.shortName, why: c.why }))
    return [...tsFund, ...TS_INTERVIEW_CURRICULUM]
  }
  if (track === 'node') {
    const nodeFund = NODE_FUNDAMENTALS_CURRICULUM.map((c) => ({ title: c.title, shortName: c.shortName, why: c.why }))
    return [...nodeFund, ...NODE_INTERVIEW_CURRICULUM]
  }
  if (track === 'express') {
    return EXPRESS_FUNDAMENTALS_CURRICULUM.map((c) => ({ title: c.title, shortName: c.shortName, why: c.why }))
  }
  if (track === 'python') {
    return PYTHON_FUNDAMENTALS_CURRICULUM.map((c) => ({ title: c.title, shortName: c.shortName, why: c.why }))
  }
  if (track === 'sd') return SD_CURRICULUM.map((c) => ({ title: c.title, shortName: c.shortName, why: c.why }))
  if (track === 'pe') return PE_CURRICULUM.map((c) => ({ title: c.title, shortName: c.shortName, why: c.why }))
  if (track === 'sec') return SEC_CURRICULUM.map((c) => ({ title: c.title, shortName: c.shortName, why: c.why }))
  if (track === 'el') return EL_CURRICULUM.map((c) => ({ title: c.title, shortName: c.shortName, why: c.why }))
  if (track === 'fe') return FE_CURRICULUM.map((c) => ({ title: c.title, shortName: c.shortName, why: c.why }))
  if (track === 'css') {
    return CSS_CURRICULUM.map((c) => ({ title: c.title, shortName: c.shortName }))
  }
  if (track === 'angular' || track === 'vue') {
    return null // same shared blueprint titles as React (LESSON_LIST in LandingPage)
  }
  if (track === 'mobile-angular') {
    return MOBILE_ANGULAR_LESSONS.map((c) => ({ title: c.title, shortName: c.shortName }))
  }
  if (ALGO_AI_TRACKS.includes(track)) {
    return ALGO_AI_NAMES.map((title) => ({ title }))
  }
  return null // react-js and react-ts use LESSON_LIST from LandingPage
}

import { AI_LESSONS_CONFIG } from './ai-lessons/config.js'
import { ALGO_AI_NAMES } from './ai-lessons/algoAiNames.js'
import DynamicLessonPage from './ai-lessons/DynamicLessonPage.jsx'
import { LessonValidationContext } from './ai-lessons/lessonValidationContext.jsx'
import {
  LocalLessonReviewProvider,
} from './localLessonReview/LocalLessonReview.jsx'
import {
  mustSoftRegisterToAccess,
  mustHardRegisterToAccess,
  mustLoginToUnlockPastAnonymousLimit,
  mustPayToAccess,
  getSoftGateKind,
  hasEverRegistered,
  getFreeLessonsRemaining,
  getAnonymousFreeSlotsRemaining,
  recordLessonAccess,
  deductLessonPayment,
  getBalanceCents,
  getLessonPriceCents,
  TOTAL_FREE_LESSONS,
  MAX_FREE_UNREGISTERED,
  getStoredUser,
  logout,
  getRegisterDismissCount,
  incrementRegisterDismissCount,
  savePendingLesson,
  peekPendingLesson,
  clearPendingLesson,
} from './auth/lessonAccess.js'
import {
  buildLessonPath,
  parseLessonPath,
  setStoredRedirectPath,
  getStoredRedirectPath,
  clearStoredRedirectPath,
  getHashRoutePathname,
} from './auth/redirectPath.js'
import RegisterModal from './auth/RegisterModal.jsx'
import AddFundsModal from './auth/AddFundsModal.jsx'
import UserDashboard from './auth/UserDashboard.jsx'
import { addAppUsageSeconds } from './auth/appUsageTime.js'
import CinematicLanding from './CinematicLanding.jsx'
import EnterpriseReadinessGate from './EnterpriseReadinessGate.jsx'
import ReactTsPatternsBridge, {
  isReactTsPatternsBridgeDismissed,
  REACT_TS_PATTERNS_BRIDGE_STORAGE_KEY,
} from './ReactTsPatternsBridge.jsx'
import {
  onAuthStateChange,
  getSession,
  upsertProfile,
  signOut as supabaseSignOut,
  recordLessonStart,
  recordLessonComplete,
  isSupabaseConfigured,
  isSupabaseAuthUserId,
} from './auth/supabase.js'
import { signOutFirebase } from './auth/firebase.js'
import { setRegistered as setRegisteredLocal } from './auth/lessonAccess.js'
import { LEARNER_FOCUS_TRACK } from './auth/learnerFocus.js'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const [track, setTrack] = useState(LEARNER_FOCUS_TRACK)
  const [lessonTrack, setLessonTrack] = useState(null) // track locked when lesson is opened (so React TS lesson never uses react-js)
  const [lessonIndex, setLessonIndex] = useState(null) // null = landing, 0-based index = lesson
  const [selectedLessonItem, setSelectedLessonItem] = useState(null) // { title, shortName?, why? } when a card is clicked
  const [useAILessonFailed, setUseAILessonFailed] = useState(false) // fallback to local engine when AI path fails
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  /** Supabase emailed a recovery link; user must set a new password before normal sync. */
  const [passwordRecoveryActive, setPasswordRecoveryActive] = useState(false)
  /** 'soft' = dismissible; 'hard' = must register; 'startFree' = first-run CTA (Google / email / guest). */
  const [registerModalVariant, setRegisterModalVariant] = useState('soft')
  const [showAddFundsModal, setShowAddFundsModal] = useState(false)
  const [pendingLesson, setPendingLesson] = useState(null) // { track, index, item } when gated
  const [welcomeBonusMessage, setWelcomeBonusMessage] = useState('')
  const [user, setUser] = useState(() => getStoredUser())
  /** Full page load / refresh: JS cinematic landing only on learner home — never on IPF ops hashes. */
  const [showCinematic, setShowCinematic] = useState(() => {
    if (typeof window === 'undefined') return true
    const p = getHashRoutePathname()
    if (p.startsWith('/lessons/') || p === '/register') return false
    // Only the learner root shows cinematic; /pd-studio etc. are separate routes (see main.jsx).
    return p === '/' || p === ''
  })
  /** In-session hide after dismiss (localStorage is written inside ReactTsPatternsBridge). */
  const [patternsBridgeDismissedLocal, setPatternsBridgeDismissedLocal] = useState(false)
  /** IPF: shown once, right after "Start doing" — the fork between applying for real matched work
   * (SpecForge tasks, reviewed like a real PR) and the plain self-paced lesson catalog. */
  const [showEnterpriseGate, setShowEnterpriseGate] = useState(false)
  // Include `showCinematic`: after cinematic we clear bridge LS — deps must change or useMemo keeps stale `false`.
  const showReactTsPatternsBridge = useMemo(
    () =>
      !patternsBridgeDismissedLocal &&
      track === LEARNER_FOCUS_TRACK &&
      !isReactTsPatternsBridgeDismissed(),
    [patternsBridgeDismissedLocal, track, showCinematic]
  )
  /** false until first Supabase getSession() finishes — avoids lesson gates before localStorage mirrors session. */
  const [authSessionReady, setAuthSessionReady] = useState(!isSupabaseConfigured)

  const lessonGateOpts = useMemo(() => ({ loggedIn: Boolean(user?.id) }), [user?.id])
  const softGateKindForModal = useMemo(() => {
    if (registerModalVariant !== 'soft' || !pendingLesson) return null
    return getSoftGateKind(pendingLesson.track, pendingLesson.index, lessonGateOpts)
  }, [registerModalVariant, pendingLesson, lessonGateOpts])
  const freeLessonsHint = useMemo(() => {
    if (user?.id) {
      const r = getFreeLessonsRemaining({ loggedIn: true })
      return r != null ? `${r}/${TOTAL_FREE_LESSONS} free lessons left` : null
    }
    if (hasEverRegistered()) return null
    const left = getAnonymousFreeSlotsRemaining()
    return `${left} of ${MAX_FREE_UNREGISTERED} anonymous free lessons left`
  }, [user?.id])
  const showWelcomeBackBanner = hasEverRegistered() && !user?.id
  const showRegBonusToast = Boolean(user?.id && welcomeBonusMessage)
  const catalogTopPadding =
    38 + (showWelcomeBackBanner ? 44 : 0) + (showRegBonusToast ? 44 : 0)
  /** Track + list index for the open lesson (for Supabase progress). */
  const activeLessonTrack = useMemo(
    () => (lessonIndex != null && lessonTrack != null ? lessonTrack : track),
    [lessonIndex, lessonTrack, track]
  )
  const lessonOpenedAtRef = useRef(null)

  const openLesson = useCallback(
    (idx, item, trackOverride) => {
      clearPendingLesson()
      clearStoredRedirectPath()
      const t = trackOverride ?? track
      setLessonTrack(t)
      recordLessonAccess(t, idx)
      setLessonIndex(idx)
      setSelectedLessonItem(item ?? null)
      setUseAILessonFailed(false)
      setPendingLesson(null)
      navigate(buildLessonPath(t, idx), { replace: true })
    },
    [track, navigate]
  )

  const goToVoluntaryRegister = useCallback(() => {
    setPendingLesson(null)
    clearStoredRedirectPath()
    setRegisterModalVariant('soft')
    setLessonIndex(null)
    setSelectedLessonItem(null)
    setLessonTrack(null)
    setUseAILessonFailed(false)
    navigate('/register')
  }, [navigate])

  // Supabase: subscribe, await getSession(), mirror to localStorage, then allow lesson clicks.
  // Resume lesson via useLayoutEffect (peekPendingLesson) or redirectPath after email sign-in.
  useEffect(() => {
    const syncUserFromSession = (session) => {
      if (!session?.user) return
      const u = session.user
      const profile = {
        name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
        emailOrPhone: u.email || '',
        id: u.id,
        avatarUrl: u.user_metadata?.avatar_url || '',
      }
      setRegisteredLocal(profile)
      setUser(profile)
      upsertProfile(u)
      setPasswordRecoveryActive(false)
      setShowRegisterModal(false)
      setShowCinematic(false)
      const rp = getStoredRedirectPath()
      clearStoredRedirectPath()
      if (rp) navigate(rp, { replace: true })
    }

    if (!isSupabaseConfigured) return undefined

    /** Supabase implicit recovery uses #...type=recovery; PKCE reset links use ?code=... only (no type= in URL). */
    const recoveryInUrl = () => {
      if (typeof window === 'undefined') return false
      const { hash, search } = window.location
      if (hash.includes('type=recovery') || /[?&]type=recovery/.test(search)) return true
      if (/[?&]code=/.test(search)) return true
      return false
    }

    let unsub = () => {}
    const authReadyTimeout = window.setTimeout(() => setAuthSessionReady(true), 10000)
    ;(async () => {
      const { data } = onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          logout()
          setUser(null)
          clearStoredRedirectPath()
          setPasswordRecoveryActive(false)
          return
        }
        if (event === 'PASSWORD_RECOVERY' && session?.user) {
          setPasswordRecoveryActive(true)
          setShowRegisterModal(true)
          setShowCinematic(false)
          return
        }
        if (session?.user) {
          syncUserFromSession(session)
        }
      })
      unsub = () => data.subscription.unsubscribe()
      await new Promise((r) => setTimeout(r, 0))
      let session = await getSession()
      if (session?.user && !recoveryInUrl()) syncUserFromSession(session)
      await new Promise((r) => setTimeout(r, 0))
      session = await getSession()
      if (session?.user && !recoveryInUrl()) syncUserFromSession(session)
      window.clearTimeout(authReadyTimeout)
      setAuthSessionReady(true)
    })()

    return () => {
      window.clearTimeout(authReadyTimeout)
      unsub()
    }
  }, [navigate])

  useLayoutEffect(() => {
    if (!user?.id) return
    if (parseLessonPath(location.pathname)) {
      clearPendingLesson()
      return
    }
    const p = peekPendingLesson()
    if (lessonIndex !== null) {
      if (p) clearPendingLesson()
      return
    }
    if (!p || typeof p.index !== 'number' || !p.track) return
    if (p.track !== LEARNER_FOCUS_TRACK) {
      clearPendingLesson()
      return
    }
    setLessonTrack(p.track)
    recordLessonAccess(p.track, p.index)
    setLessonIndex(p.index)
    setSelectedLessonItem(p.item ?? null)
    setUseAILessonFailed(false)
    setPendingLesson(null)
    setShowCinematic(false)
    setShowRegisterModal(false)
    clearPendingLesson()
    navigate(buildLessonPath(p.track, p.index), { replace: true })
  }, [user?.id, lessonIndex, location.pathname, navigate])

  useEffect(() => {
    if (!authSessionReady) return
    const parsed = parseLessonPath(location.pathname)
    if (!parsed) return
    if (parsed.track !== LEARNER_FOCUS_TRACK) {
      navigate('/', { replace: true })
      return
    }

    setShowCinematic(false)
    const { track: t, index: i } = parsed
    setTrack(t)
    const list = getLessonList(t)
    const item =
      list?.[i] ??
      (t === 'angular' || t === 'vue' || t === 'react-js' || t === 'react-ts'
        ? LESSON_LIST[i] != null
          ? { title: LESSON_LIST[i] }
          : null
        : null)

    const opts = { loggedIn: Boolean(user?.id) }

    if (mustLoginToUnlockPastAnonymousLimit(t, i, opts)) {
      setPendingLesson({ track: t, index: i, item })
      savePendingLesson(t, i, item)
      setStoredRedirectPath(buildLessonPath(t, i))
      setRegisterModalVariant('loginWall')
      setShowRegisterModal(true)
      if (location.pathname !== '/register') navigate('/register', { replace: true })
      return
    }
    if (mustHardRegisterToAccess(t, i, opts)) {
      setPendingLesson({ track: t, index: i, item })
      savePendingLesson(t, i, item)
      setStoredRedirectPath(buildLessonPath(t, i))
      setRegisterModalVariant('hard')
      setShowRegisterModal(true)
      if (location.pathname !== '/register') navigate('/register', { replace: true })
      return
    }
    if (mustSoftRegisterToAccess(t, i, opts)) {
      setPendingLesson({ track: t, index: i, item })
      savePendingLesson(t, i, item)
      setStoredRedirectPath(buildLessonPath(t, i))
      setRegisterModalVariant('soft')
      setShowRegisterModal(true)
      if (location.pathname !== '/register') navigate('/register', { replace: true })
      return
    }
    if (mustPayToAccess(t, i, opts)) {
      if (getBalanceCents() >= getLessonPriceCents()) {
        deductLessonPayment()
        openLesson(i, item, t)
        return
      }
      setPendingLesson({ track: t, index: i, item })
      savePendingLesson(t, i, item)
      setStoredRedirectPath(buildLessonPath(t, i))
      setShowAddFundsModal(true)
      return
    }
    openLesson(i, item, t)
  }, [location.pathname, authSessionReady, user?.id, openLesson, navigate])

  useEffect(() => {
    if (location.pathname === '/register') {
      setShowCinematic(false)
      setShowRegisterModal(true)
    }
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname !== '/dashboard') return
    setShowCinematic(false)
    setLessonIndex(null)
    setSelectedLessonItem(null)
    setLessonTrack(null)
    setTrack(LEARNER_FOCUS_TRACK)
  }, [location.pathname])

  useEffect(() => {
    if (lessonIndex !== null) return
    if (parseLessonPath(location.pathname)) return
    setTrack(LEARNER_FOCUS_TRACK)
  }, [lessonIndex, location.pathname])

  useEffect(() => {
    if (!user?.id) return undefined
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') addAppUsageSeconds(user.id, 15)
    }, 15000)
    return () => clearInterval(id)
  }, [user?.id])

  const handleLessonComplete = useCallback(() => {
    const uid = user?.id
    if (!uid || !isSupabaseConfigured || !isSupabaseAuthUserId(uid) || lessonIndex == null) return
    const opened = lessonOpenedAtRef.current
    const sec = opened ? Math.max(0, Math.round((Date.now() - opened) / 1000)) : 0
    void recordLessonComplete(uid, activeLessonTrack, lessonIndex, sec)
  }, [user?.id, lessonIndex, activeLessonTrack, isSupabaseConfigured])

  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured || !isSupabaseAuthUserId(user.id) || lessonIndex == null) return
    const t = activeLessonTrack
    const idx = lessonIndex
    const list =
      t === 'angular'
        ? buildAngularLessonList()
        : getLessonList(t) ?? LESSON_LIST.map((title) => ({ title }))
    const title = selectedLessonItem?.title ?? list?.[idx]?.title ?? ''
    lessonOpenedAtRef.current = Date.now()
    void recordLessonStart(user.id, t, idx, title)
  }, [user?.id, lessonIndex, activeLessonTrack, selectedLessonItem?.title, isSupabaseConfigured])

  const onBackToLessons = () => {
    setLessonIndex(null)
    setSelectedLessonItem(null)
    setLessonTrack(null)
    setUseAILessonFailed(false)
    setPendingLesson(null)
    setTrack(LEARNER_FOCUS_TRACK)
    navigate('/', { replace: true })
  }

  const handleSelectLesson = (i, item) => {
    const t = LEARNER_FOCUS_TRACK
    if (mustLoginToUnlockPastAnonymousLimit(t, i, lessonGateOpts)) {
      setPendingLesson({ track: t, index: i, item })
      savePendingLesson(t, i, item)
      setStoredRedirectPath(buildLessonPath(t, i))
      setRegisterModalVariant('loginWall')
      setShowRegisterModal(true)
      navigate('/register', { replace: true })
      return
    }
    if (mustHardRegisterToAccess(t, i, lessonGateOpts)) {
      setPendingLesson({ track: t, index: i, item })
      savePendingLesson(t, i, item)
      setStoredRedirectPath(buildLessonPath(t, i))
      setRegisterModalVariant('hard')
      setShowRegisterModal(true)
      navigate('/register', { replace: true })
      return
    }
    if (mustSoftRegisterToAccess(t, i, lessonGateOpts)) {
      setPendingLesson({ track: t, index: i, item })
      savePendingLesson(t, i, item)
      setStoredRedirectPath(buildLessonPath(t, i))
      setRegisterModalVariant('soft')
      setShowRegisterModal(true)
      navigate('/register', { replace: true })
      return
    }
    if (mustPayToAccess(t, i, lessonGateOpts)) {
      if (getBalanceCents() >= getLessonPriceCents()) {
        deductLessonPayment()
        openLesson(i, item, t)
        return
      }
      setPendingLesson({ track: t, index: i, item })
      savePendingLesson(t, i, item)
      setStoredRedirectPath(buildLessonPath(t, i))
      setShowAddFundsModal(true)
      return
    }
    openLesson(i, item, t)
  }

  const registerSuccess = (meta) => {
    setUser(getStoredUser())
    setShowRegisterModal(false)
    setRegisterModalVariant('soft')
    const pl = pendingLesson
    clearPendingLesson()
    setPendingLesson(null)
    if (meta?.flow === 'register' || meta?.flow === 'google') {
      const r = getFreeLessonsRemaining({ loggedIn: true })
      if (r != null && r > 0) {
        setWelcomeBonusMessage(
          `You have ${r} included lesson${r === 1 ? '' : 's'} left before paid lessons.`
        )
        window.setTimeout(() => setWelcomeBonusMessage(''), 12000)
      }
    }
    if (pl && pl.track === LEARNER_FOCUS_TRACK) openLesson(pl.index, pl.item, pl.track)
  }

  const registerModalDismiss = () => {
    incrementRegisterDismissCount()
    setShowRegisterModal(false)
    setRegisterModalVariant('soft')
    const pl = pendingLesson
    clearPendingLesson()
    setPendingLesson(null)
    if (location.pathname === '/register') navigate('/', { replace: true })
    if (pl && pl.track === LEARNER_FOCUS_TRACK) openLesson(pl.index, pl.item, pl.track)
  }

  const startFreeGuestContinue = () => {
    setShowRegisterModal(false)
    setRegisterModalVariant('soft')
    const pl = pendingLesson
    clearPendingLesson()
    setPendingLesson(null)
    if (location.pathname === '/register') navigate('/', { replace: true })
    if (pl && pl.track === LEARNER_FOCUS_TRACK) openLesson(pl.index, pl.item, pl.track)
  }

  const registerModalOnClose = passwordRecoveryActive
    ? undefined
    : registerModalVariant === 'soft'
      ? registerModalDismiss
      : registerModalVariant === 'startFree'
        ? startFreeGuestContinue
        : undefined

  const handleLogout = async () => {
    await supabaseSignOut()
    try {
      await signOutFirebase()
    } catch {
      /* ignore */
    }
    logout()
    setUser(null)
  }

  const authBarStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#0f172a',
  }
  const authBtnStyle = {
    background: '#ffffff',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#0f172a',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    padding: '6px 14px',
  }

  const addFundsDone = () => {
    setShowAddFundsModal(false)
    if (pendingLesson && getBalanceCents() >= getLessonPriceCents()) {
      deductLessonPayment()
      openLesson(pendingLesson.index, pendingLesson.item, pendingLesson.track)
    }
    setPendingLesson(null)
  }

  const lessonPathFromUrl = parseLessonPath(location.pathname)
  if (!authSessionReady && !lessonPathFromUrl) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#e2e8f0',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: '14px',
        }}
      >
        Signing you in…
      </div>
    )
  }

  if (location.pathname === '/dashboard') {
    return (
      <>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9998,
            padding: '6px 14px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <button type="button" style={authBtnStyle} onClick={() => navigate('/', { replace: true })}>
            ← All lessons
          </button>
          <div style={authBarStyle}>
            {user ? (
              <>
                <span>Hi, {user.name || user.emailOrPhone || 'User'}</span>
                <button type="button" style={authBtnStyle} onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <button
                type="button"
                style={{ ...authBtnStyle, borderColor: '#00d4ff', color: '#052545', background: '#00d4ff' }}
                onClick={goToVoluntaryRegister}
              >
                Log in
              </button>
            )}
          </div>
        </div>
        <div style={{ paddingTop: '38px' }}>
          <UserDashboard user={user} />
        </div>
        {showRegisterModal && (
          <RegisterModal
            variant={registerModalVariant}
            voluntary={!pendingLesson}
            dismissCount={getRegisterDismissCount()}
            softGateKind={softGateKindForModal}
            onSuccess={registerSuccess}
            onClose={registerModalOnClose}
            passwordRecovery={passwordRecoveryActive}
            onPasswordRecoveryComplete={() => {
              setPasswordRecoveryActive(false)
              setShowRegisterModal(false)
            }}
          />
        )}
        {showAddFundsModal && <AddFundsModal user={user} onDone={addFundsDone} />}
      </>
    )
  }

  if (lessonIndex === null) {
    if (showEnterpriseGate) {
      return (
        <EnterpriseReadinessGate
          onApply={() => {
            window.location.hash = '#/join'
          }}
          onJustLessons={() => {
            try {
              window.localStorage.removeItem(REACT_TS_PATTERNS_BRIDGE_STORAGE_KEY)
            } catch {
              /* ignore */
            }
            setPatternsBridgeDismissedLocal(false)
            setTrack(LEARNER_FOCUS_TRACK)
            setShowCinematic(false)
            setShowEnterpriseGate(false)
          }}
        />
      )
    }
    if (showCinematic) {
      return (
        <CinematicLanding
          onEnterEnterprise={() => {
            window.location.hash = '#/join'
          }}
          onEnterLessons={() => {
            try {
              window.localStorage.removeItem(REACT_TS_PATTERNS_BRIDGE_STORAGE_KEY)
            } catch {
              /* ignore */
            }
            setPatternsBridgeDismissedLocal(false)
            setTrack(LEARNER_FOCUS_TRACK)
            setShowCinematic(false)
            setShowEnterpriseGate(false)
          }}
        />
      )
    }

    if (showReactTsPatternsBridge) {
      return (
        <ReactTsPatternsBridge
          onComplete={() => {
            setPatternsBridgeDismissedLocal(true)
          }}
          onOpenLesson1={() => {
            setPatternsBridgeDismissedLocal(true)
            const list = getLessonList(LEARNER_FOCUS_TRACK)
            const item = list?.[0] ?? { title: LESSON_LIST[0] ?? 'Lesson 1' }
            handleSelectLesson(0, item)
          }}
        />
      )
    }

    return (
      <>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9998,
            padding: '6px 14px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{ ...authBarStyle, width: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user ? (
                <button type="button" style={authBtnStyle} onClick={() => navigate('/dashboard')}>
                  Dashboard
                </button>
              ) : null}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user ? (
                <>
                  <span>Hi, {user.name || user.emailOrPhone || 'User'}</span>
                  <button type="button" style={authBtnStyle} onClick={handleLogout}>
                    Log out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  style={{ ...authBtnStyle, borderColor: '#00d4ff', color: '#052545', background: '#00d4ff' }}
                  onClick={goToVoluntaryRegister}
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </div>
        {showWelcomeBackBanner ? (
          <div
            role="status"
            style={{
              position: 'fixed',
              top: '38px',
              left: 0,
              right: 0,
              zIndex: 9997,
              padding: '10px 14px',
              background: '#ecfeff',
              borderBottom: '1px solid #67e8f9',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#0c4a6e',
              textAlign: 'center',
              lineHeight: 1.45,
            }}
          >
            Welcome back! Log in to continue with any remaining included lessons on this browser.
          </div>
        ) : null}
        {showRegBonusToast ? (
          <div
            role="status"
            style={{
              position: 'fixed',
              top: showWelcomeBackBanner ? '82px' : '38px',
              left: 0,
              right: 0,
              zIndex: 9997,
              padding: '10px 14px',
              background: '#d1fae5',
              borderBottom: '1px solid #6ee7b7',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#065f46',
              textAlign: 'center',
            }}
          >
            {welcomeBonusMessage}
          </div>
        ) : null}
        <div style={{ paddingTop: `${catalogTopPadding}px` }}>
          <LandingPage
            track={LEARNER_FOCUS_TRACK}
            onSelectLesson={handleSelectLesson}
            lessonList={getLessonList(LEARNER_FOCUS_TRACK)}
            freeLessonsHint={freeLessonsHint}
          />
        </div>
        {showRegisterModal && (
          <RegisterModal
            variant={registerModalVariant}
            voluntary={!pendingLesson}
            dismissCount={getRegisterDismissCount()}
            softGateKind={softGateKindForModal}
            onSuccess={registerSuccess}
            onClose={registerModalOnClose}
            passwordRecovery={passwordRecoveryActive}
            onPasswordRecoveryComplete={() => {
              setPasswordRecoveryActive(false)
              setShowRegisterModal(false)
            }}
          />
        )}
        {showAddFundsModal && <AddFundsModal user={user} onDone={addFundsDone} />}
      </>
    )
  }

  // When viewing a lesson, use the track that was selected when they opened it (lessonTrack) so React TS never gets react-js content.
  const effectiveTrack = (lessonIndex != null && lessonTrack != null) ? lessonTrack : track
  const lessonList =
    effectiveTrack === 'angular'
      ? buildAngularLessonList()
      : (getLessonList(effectiveTrack) ?? LESSON_LIST.map((title) => ({ title })))
  const engines = getEngines(effectiveTrack, lessonList?.length)
  const Engine = engines[lessonIndex]

  const onNextLesson = () => {
    const next = Math.min(lessonIndex + 1, engines.length - 1)
    if (next === lessonIndex) return
    if (mustLoginToUnlockPastAnonymousLimit(effectiveTrack, next, lessonGateOpts)) {
      const nextItem = lessonList[next] ?? null
      setLessonIndex(null)
      setSelectedLessonItem(null)
      setLessonTrack(null)
      setUseAILessonFailed(false)
      setPendingLesson({ track: effectiveTrack, index: next, item: nextItem })
      savePendingLesson(effectiveTrack, next, nextItem)
      setStoredRedirectPath(buildLessonPath(effectiveTrack, next))
      setRegisterModalVariant('loginWall')
      setShowRegisterModal(true)
      navigate('/register', { replace: true })
      return
    }
    if (mustHardRegisterToAccess(effectiveTrack, next, lessonGateOpts)) {
      const nextItem = lessonList[next] ?? null
      setLessonIndex(null)
      setSelectedLessonItem(null)
      setLessonTrack(null)
      setUseAILessonFailed(false)
      setPendingLesson({ track: effectiveTrack, index: next, item: nextItem })
      savePendingLesson(effectiveTrack, next, nextItem)
      setStoredRedirectPath(buildLessonPath(effectiveTrack, next))
      setRegisterModalVariant('hard')
      setShowRegisterModal(true)
      navigate('/register', { replace: true })
      return
    }
    if (mustSoftRegisterToAccess(effectiveTrack, next, lessonGateOpts)) {
      const nextItem = lessonList[next] ?? null
      setLessonIndex(null)
      setSelectedLessonItem(null)
      setLessonTrack(null)
      setUseAILessonFailed(false)
      setPendingLesson({ track: effectiveTrack, index: next, item: nextItem })
      savePendingLesson(effectiveTrack, next, nextItem)
      setStoredRedirectPath(buildLessonPath(effectiveTrack, next))
      setRegisterModalVariant('soft')
      setShowRegisterModal(true)
      navigate('/register', { replace: true })
      return
    }
    if (mustPayToAccess(effectiveTrack, next, lessonGateOpts)) {
      if (getBalanceCents() >= getLessonPriceCents()) {
        deductLessonPayment()
        openLesson(next, lessonList[next] ?? null)
        return
      }
      setPendingLesson({ track: effectiveTrack, index: next, item: lessonList[next] ?? null })
      savePendingLesson(effectiveTrack, next, lessonList[next] ?? null)
      setStoredRedirectPath(buildLessonPath(effectiveTrack, next))
      setShowAddFundsModal(true)
      return
    }
    openLesson(next, lessonList[next] ?? null)
  }
  const useAILessons = AI_LESSONS_CONFIG.useAILessons && !useAILessonFailed
  const lessonTitle = selectedLessonItem?.title ?? lessonList[lessonIndex]?.title ?? `Lesson ${lessonIndex + 1}`
  const hasStaticEngine = Boolean(engines[lessonIndex])
  const useDynamicLesson = effectiveTrack === 'mobile-angular' || ALGO_AI_TRACKS.includes(effectiveTrack) || (useAILessons || !hasStaticEngine)

  if (useDynamicLesson) {
    return (
      <LocalLessonReviewProvider
        enabled={import.meta.env.DEV}
        lessonIndex={lessonIndex}
        track={effectiveTrack}
        lessonTitle={lessonTitle ?? ''}
      >
      <>
        {/* Top bar: left/center transparent so Lesson/Editor/Output tabs are visible; header (bg + border) only behind name + login */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            padding: '10px 16px',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={onBackToLessons}
              style={{
                background: 'rgb(5, 37, 67)',
                border: 'none',
                borderRadius: '6px',
                color: '#00d4ff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.05em',
                padding: '6px 12px',
              }}
            >
              ← All Lessons
            </button>
            {effectiveTrack && (
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                {({ 'react-js': 'React · JS', 'react-ts': 'React · TS', angular: 'Angular', 'mobile-angular': 'Mobile Angular', vue: 'Vue', js: 'JavaScript', ts: 'TypeScript', node: 'Node', express: 'Express', python: 'Python', css: 'CSS', sd: 'System Design', pe: 'Production Eng', sec: 'Security', el: 'Eng Leadership', fe: 'Frontend Eng', 'algo-js': 'Algo · JS', 'algo-ts': 'Algo · TS', 'algo-python': 'Algo · Python', 'algo-java': 'Algo · Java' })[effectiveTrack] ?? effectiveTrack}
              </span>
            )}
            {user ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'rgb(5, 37, 67)',
                  border: '1px solid #00d4ff',
                  borderRadius: '6px',
                  color: '#00d4ff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '6px 12px',
                }}
              >
                Dashboard
              </button>
            ) : null}
          </div>
          <div
            style={{
              pointerEvents: 'auto',
              background: '#ffffff',
              borderBottom: '1px solid #0f172a',
              borderLeft: '1px solid #0f172a',
              borderBottomLeftRadius: '8px',
              padding: '8px 16px',
              margin: '-10px -16px -10px 0',
            }}
          >
            <div style={authBarStyle}>
              {user ? (
                <>
                  <span>Hi, {user.name || user.emailOrPhone || 'User'}</span>
                  <button type="button" style={authBtnStyle} onClick={handleLogout}>
                    Log out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  style={{ ...authBtnStyle, borderColor: '#00d4ff', color: '#052545', background: '#00d4ff' }}
                  onClick={goToVoluntaryRegister}
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </div>
        <LessonValidationContext.Provider
          value={{
            track: effectiveTrack,
            lessonIndex: lessonIndex,
            lessonTitle: lessonTitle ?? '',
            lessonKey: `${effectiveTrack}:${lessonIndex}:${lessonTitle ?? ''}`,
          }}
        >
          <DynamicLessonPage
            track={lessonTrack ?? track}
            lessonTitle={lessonTitle}
            lessonIndex={lessonIndex}
            onBackToLessons={onBackToLessons}
            onNextLesson={onNextLesson}
            onLessonComplete={user?.id ? handleLessonComplete : undefined}
            onFallbackToLocal={AI_LESSONS_CONFIG.fallbackToLocalOnError ? () => setUseAILessonFailed(true) : undefined}
          />
        </LessonValidationContext.Provider>
        {showRegisterModal && (
          <RegisterModal
            variant={registerModalVariant}
            voluntary={!pendingLesson}
            dismissCount={getRegisterDismissCount()}
            softGateKind={softGateKindForModal}
            onSuccess={registerSuccess}
            onClose={registerModalOnClose}
            passwordRecovery={passwordRecoveryActive}
            onPasswordRecoveryComplete={() => {
              setPasswordRecoveryActive(false)
              setShowRegisterModal(false)
            }}
          />
        )}
        {showAddFundsModal && <AddFundsModal user={user} onDone={addFundsDone} />}
      </>
      </LocalLessonReviewProvider>
    )
  }

  if (!Engine) {
    return (
      <>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, padding: '12px 24px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', fontFamily: "'DM Sans', sans-serif", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button type="button" onClick={onBackToLessons} style={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#ffffff', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: '8px 14px' }}>← All Lessons</button>
            {user ? (
              <button type="button" style={authBtnStyle} onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
            ) : null}
          </div>
          <div style={authBarStyle}>
            {user ? (
              <>
                <span>Hi, {user.name || user.emailOrPhone || 'User'}</span>
                <button type="button" style={authBtnStyle} onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <button
                type="button"
                style={{ ...authBtnStyle, borderColor: '#00d4ff', color: '#052545', background: '#00d4ff' }}
                onClick={goToVoluntaryRegister}
              >
                Log in
              </button>
            )}
          </div>
        </div>
        <div style={{ paddingTop: '52px', textAlign: 'center', padding: '48px' }}>Select a lesson from the list.</div>
        {showRegisterModal && (
          <RegisterModal
            variant={registerModalVariant}
            voluntary={!pendingLesson}
            dismissCount={getRegisterDismissCount()}
            softGateKind={softGateKindForModal}
            onSuccess={registerSuccess}
            onClose={registerModalOnClose}
            passwordRecovery={passwordRecoveryActive}
            onPasswordRecoveryComplete={() => {
              setPasswordRecoveryActive(false)
              setShowRegisterModal(false)
            }}
          />
        )}
        {showAddFundsModal && <AddFundsModal user={user} onDone={addFundsDone} />}
      </>
    )
  }

  return (
    <LocalLessonReviewProvider
      enabled={import.meta.env.DEV}
      lessonIndex={lessonIndex}
      track={effectiveTrack}
      lessonTitle={lessonTitle ?? ''}
    >
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          padding: '12px 24px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          fontFamily: "'DM Sans', sans-serif",
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onBackToLessons}
            style={{
              background: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.05em',
              padding: '8px 14px',
            }}
          >
            ← All Lessons
          </button>
          {effectiveTrack && (
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              {({ 'react-js': 'React · JS', 'react-ts': 'React · TS', angular: 'Angular', 'mobile-angular': 'Mobile Angular', vue: 'Vue', js: 'JavaScript', ts: 'TypeScript', node: 'Node', express: 'Express', python: 'Python', css: 'CSS', sd: 'System Design', pe: 'Production Eng', sec: 'Security', el: 'Eng Leadership', fe: 'Frontend Eng', 'algo-js': 'Algo · JS', 'algo-ts': 'Algo · TS', 'algo-python': 'Algo · Python', 'algo-java': 'Algo · Java' })[effectiveTrack] ?? effectiveTrack}
            </span>
          )}
          {user ? (
            <button type="button" style={authBtnStyle} onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          ) : null}
        </div>
        <div style={authBarStyle}>
          {user ? (
            <>
              <span>Hi, {user.name || user.emailOrPhone || 'User'}</span>
              <button type="button" style={authBtnStyle} onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <button
              type="button"
              style={{ ...authBtnStyle, borderColor: '#00d4ff', color: '#052545', background: '#00d4ff' }}
              onClick={goToVoluntaryRegister}
            >
              Log in
            </button>
          )}
        </div>
      </div>
      <LessonValidationContext.Provider
        value={{
          track: effectiveTrack,
          lessonIndex: lessonIndex,
          lessonTitle: lessonTitle ?? '',
          lessonKey: `${effectiveTrack}:${lessonIndex}:${lessonTitle ?? ''}`,
        }}
      >
        <Engine
          onNextLesson={lessonIndex < engines.length - 1 ? onNextLesson : undefined}
          onBackToLessons={onBackToLessons}
          onLessonComplete={user?.id ? handleLessonComplete : undefined}
        />
      </LessonValidationContext.Provider>
      {showRegisterModal && (
        <RegisterModal
          variant={registerModalVariant}
          voluntary={!pendingLesson}
          dismissCount={getRegisterDismissCount()}
          softGateKind={softGateKindForModal}
          onSuccess={registerSuccess}
          onClose={registerModalOnClose}
          passwordRecovery={passwordRecoveryActive}
          onPasswordRecoveryComplete={() => {
            setPasswordRecoveryActive(false)
            setShowRegisterModal(false)
          }}
        />
      )}
      {showAddFundsModal && <AddFundsModal user={user} onDone={addFundsDone} />}
    </>
    </LocalLessonReviewProvider>
  )
}