import fs from 'fs'
import path from 'path'

import Configs from './config.json'

const BASE_PATH = resolve('src')
const BASE_TEMPLATE_PATH = path.join(__dirname, './template/')

function resolve(dir) {
    return path.join(__dirname, '../', dir)
}

function setFristUpper(str) {
    let s = str.charAt(0).toUpperCase()
    return s + str.slice(1)
}

function main() {
    let apis = {
        i: [],
        e: []
    }
    let routes = []
    Configs.forEach(config => {
        let p = BASE_PATH + '/view/' + config.name
        if (!fs.existsSync(p)) {
            fs.mkdirSync(p)
        }
        if (!fs.existsSync(BASE_PATH + '/api')) {
            fs.mkdirSync(BASE_PATH + '/api')
        }
        let str = generationList(config)
        fs.writeFileSync(p + '/index.vue', str)
        let apiStr = generationApi(config)
        fs.writeFileSync(BASE_PATH + '/api/' + config.name + '.js', apiStr)
        let editStr = generationEdit(config)
        fs.writeFileSync(p + '/edit.vue', editStr)
        apis.i.push(`import ${setFristUpper(config.name)}Fetch from './${config.name}'`)
        apis.e.push(`export const ${setFristUpper(config.name)}Service = new ${setFristUpper(config.name)}Fetch('${config.name}')`)
        routes.push(`{ path: '/${config.name}', name: '${config.name}', component: resolve => require(['@view/${config.name}/index.vue'], resolve), meta: { title: '${config.displayName}' } }`)
    })
    updateApiFile(apis)
    updateRoute(routes)
}

function generationList(config) {
    let str = fs.readFileSync(BASE_TEMPLATE_PATH + 'index.vue', { encoding: 'utf-8' })
    let columns = []
    config.data.forEach(item => {
        item.isSHow && columns.push(item)
    })
    str = str.replace(/\$@{columns}/g, `${columns}`)
    return str.replace(/\$@{api}/g, setFristUpper(config.name) + 'Service')
}


function generationApi(config) {
    let str = fs.readFileSync(BASE_TEMPLATE_PATH + 'api.js', { encoding: 'utf-8' })
    return str.replace(/\$@{fetch}/g, setFristUpper(config.name) + 'Fetch')
}

function updateApiFile(apis) {
    let str = fs.readFileSync(BASE_PATH + '/api/index.js', { encoding: 'utf-8' })
    let index = str.indexOf('export')
    str = str.slice(0, index - 2) + '\n' + apis.i.join('\n') + '\n' + str.slice(index - 2) + '\n' + apis.e.join('\n')
    fs.writeFileSync(BASE_PATH + '/api/index.js', str, { encoding: 'utf-8' })
}

function updateRoute(routes) {
    let str = fs.readFileSync(BASE_PATH + '/routes/routes.js', { encoding: 'utf-8' })
    let index = str.search(/{\s*?path:\s*?'\*'/)
    str = str.slice(0, index) + routes.join(',') + ',\n\t' + str.slice(index)
    fs.writeFileSync(BASE_PATH + '/routes/routes.js', str, { encoding: 'utf-8' })
}

function generationEdit(config) {
    let str = fs.readFileSync(BASE_TEMPLATE_PATH + '/edit.vue', { encoding: 'utf-8' })
    let formItems = ''
    let form = {}
    config.data.forEach(item => {
        formItems += generationFormItem(item) + '\n'
        form[item.key] = ''
    })
    str = str.replace(/\$@{formContent}/g, formItems)
    str = str.replace(/\$@{api}/g, setFristUpper(config.name) + 'Service')
    str = str.replace(/\$@{form}/g, JSON.stringify(form))
    return str
}

function generationFormItem(config) {
    let str = fs.readFileSync(BASE_TEMPLATE_PATH + '/formitem.vue', { encoding: 'utf-8' })
    if (config.type === 'Input') {
        str = str.replace(/\$@{FormItemContenr}/g, generationInput())
    }
    str = str.replace(/\$@{title}/g, config.title)
    str = str.replace(/\$@{key}/g, config.key)
    return str
}

function generationInput() {
    return fs.readFileSync(BASE_TEMPLATE_PATH + '/input.vue', { encoding: 'utf-8' })
}

function generationSelect() {

}
function generationCheckBox() {

}

main()
