import * as cbor from "cbor-web";
import get = Reflect.get;

const ChPayloadKeys = {
    ISSUER: 1,
    SUBJECT: 2,
    AUDIENCE: 3,
    EXPIRATION: 4,
    NOT_BEFORE: 5,
    ISSUED_AT: 6,
    CWT_ID: 7,

    HCERT: -260,
    LIGHT: -250
}

export class DccCert {
    constructor(public dccCose: DccCose) {

    }

    getCwtId(): string {
        return this.getValue(ChPayloadKeys.CWT_ID)
    }

    getIssuedAt(): string {
        return this.getValue(ChPayloadKeys.ISSUED_AT)
    }

    getNotBefore(): string {
        return this.getValue(ChPayloadKeys.NOT_BEFORE)
    }
    getExpiration(): string {
        return this.getValue(ChPayloadKeys.EXPIRATION)
    }

    getAudience(): string {
        return this.getValue(ChPayloadKeys.AUDIENCE)
    }


    getSubject(): string {
        return this.getValue(ChPayloadKeys.SUBJECT)
    }

    getIssuer(): string {
        return this.getValue(ChPayloadKeys.ISSUER)
    }

    public getValue(key: number) {
        return this.dccCose.getPayloadAsJson().get(key)
    }
}

export class DccHcertFactory {

    static create(dccCose: DccCose): DccHcert {
        const version = DccHcertFactory.getValue(dccCose)("ver")
        if(version){
            // could later be used to dereference different version, for now we just ignore it
            return  DccHcertFactory.dereferenceV_1_3_0(dccCose)
        }

    }

    /**
     * https://ec.europa.eu/health/sites/default/files/ehealth/docs/covid-certificate_json_specification_en.pdf
     * @param dccCose
     */
    static dereferenceV_1_3_0(dccCose: DccCose): DccHcert{
        const getMetadataValue = DccHcertFactory.getMetaDataValue(dccCose)
        const getValue = DccHcertFactory.getValue(dccCose)
        /**
         * MUST match the identifier of the schema version used for
         * producing the EUDCC.
         *  Example:
         *      "ver": "1.3.0"
         */
        const version = getValue("ver")
        /**
         * Surname(s), such as family name(s), of the holder.
         * Exactly 1 (one) non-empty field MUST be provided, with
         * all surnames included in it. In case of multiple surnames,
         * these MUST be separated by a space. Combination names
         * including hyphens or similar characters must however
         * stay the same.
         * Examples:
         *  "fn": "Musterfrau-Gößinger"
         *  "fn": "Musterfrau-Gößinger Müller"
         */
        const familyName = getValue("nam")["fn"]

        /**
            Surname(s) of the holder transliterated using the same
            convention as the one used in the holder’s machine
            readable travel documents (such as the rules defined in
            ICAO Doc 9303 Part 3).
            Exactly 1 (one) non-empty field MUST be provided, only
            including characters A-Z and <. Maximum length: 80
            characters (as per ICAO 9303 specification).
            Examples:
             "fnt": "MUSTERFRAU<GOESSINGER"
             "fnt": "MUSTERFRAU<GOESSINGER<MUELLER"
        */
        const familyNameStandardised = getValue("nam")["fnt"]

        /**
         * Forename(s), such as given name(s), of the holder.
         If the holder has no forenames, the field MUST be
         skipped.
         In all other cases, exactly 1 (one) non-empty field MUST
         be provided, with all forenames included in it. In case of
         multiple forenames, these MUST be separated by a space.
         Example:
         "gn": "Isolde Erika"
         */
        const givenName = getValue("nam")["gn"]

        /**
        Forename(s) of the holder transliterated using the same
        convention as the one used in the holder’s machine
        readable travel documents (such as the rules defined in
        ICAO Doc 9303 Part 3).
        If the holder has no forenames, the field MUST be
        skipped.
         In all other cases, exactly 1 (one) non-empty field MUST
        be provided, only including characters A-Z and <.
        Maximum length: 80 characters.
            Example:
            "gnt": "ISOLDE<ERIKA"
         */
        const givenNameStandardised = getValue("nam")["gnt"]

        /**
         * Date of birth of the DCC holder.
         Complete or partial date without time restricted to the
         range from 1900-01-01 to 2099-12-31.
         Exactly 1 (one) non-empty field MUST be provided if the
         complete or partial date of birth is known. If the date of
         birth is not known even partially, the field MUST be set to
         an empty string "". This should match the information as
         provided on travel documents.
         One of the following ISO 8601 formats MUST be used if
         information on date of birth is available. Other options are
         not supported.
         YYYY-MM-DD
         YYYY-MM
         YYYY
         (The verifier app may show missing parts of the date of
         birth using the XX convention as the one used in machine-
         readable travel documents, e.g. 1990-XX-XX.)
         Examples:
         "dob": "1979-04-14"
         "dob": "1901-08"
         "dob": "1939"
         "dob": ""
         */
        const dateOfBirth = getValue("dob")
        const person = {
            givenName, givenNameStandardised,
            familyName, familyNameStandardised,
            dateOfBirth
        }
        return new DccHcert(version, person)
    }

    /**
     * A utility function to access the metadata values.
     *
     * Metadata (payload as json) internal data model:
     * {
     *     1: ...
     *     2: ...
     *     -260: ...
     * }
     * @param dccCose
     * @private
     */
    private static getMetaDataValue(dccCose: DccCose) {
        return (key) => dccCose.getPayloadAsJson().get(key)
    }


    /**
     * A utility function to access the hcert values.
     *
     * Hcert (payload as json) internal data model:
     * {
     *     -260: {
     *         1: {
     *             v: ...
     *             dob: ...
     *             name: ...
     *             ver: ...
     *         }
     *     }
     * }
     * @param dccHcert
     * @private
     */
    private static getValue(dccCose: DccCose) {
        return (key) => dccCose.getPayloadAsJson().get(ChPayloadKeys.HCERT).get(1)[key]
    }

}


export class DccHcert {

    constructor(
        public readonly schemaVersion: string,

        public readonly person: {
            familyName: string,
            familyNameStandardised: string,
            givenName:string,
            givenNameStandardised: string,
            dateOfBirth: string
        }
    ) {

    }


}


export class DccCose {
    public signedHeader: CoseSignedHeader;
    public unsignedHeader: CoseUnsignedHeader;
    public payload: CosePayload;
    public signature: CoseSignature;
    private payloadAsJson: any;

    constructor(private readonly cose: Cose) {
        this.signedHeader   = cose.value[CoseKeys.CoseSignedHeader]
        this.unsignedHeader = cose.value[CoseKeys.CoseUnsignedHeader]
        this.payload        = cose.value[CoseKeys.CosePayload]
        this.signature      = cose.value[CoseKeys.CoseSignature]
        this.payloadAsJson  = cbor.decode(this.payload)
    }

    getContentToSign(){
       return  cbor.encode(["Signature1", this.signedHeader, this.unsignedHeader, this.payload])
    }

    getPayloadAsJson(): any{
        return this.payloadAsJson
    }
}


export type CoseSignedHeader = Uint8Array
export type CoseUnsignedHeader = Uint8Array
export type CosePayload = Uint8Array
export type CoseSignature = Uint8Array
export const CoseKeys = {
    CoseSignedHeader: 0,
    CoseUnsignedHeader: 1,
    CosePayload: 2,
    CoseSignature: 3
}
export type Cose ={
    tag: number,
    value: [
        CoseSignedHeader,
        CoseUnsignedHeader,
        CosePayload,
        CoseSignature
    ]
}



export type Base45 = string;
type DccType = 'HC1';

export class DccBase45 {
    public readonly type: DccType
    public readonly base45: Base45

    constructor(public readonly certificateWithPrefix: Base45) {
        this.type = certificateWithPrefix.substr(0,3) as DccType;
        this.base45 = this.certificateWithPrefix.substr(4)

        if (this.type !== 'HC1') {
            throw new Error(`Certificate Type: ${this.type} is not supported.`)
        }
    }
}



export type DccZlibCompressed = Buffer
export type DccCbor = Buffer



