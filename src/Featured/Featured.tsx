import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { Link, useLocation, NavLink } from 'react-router-dom';

import { GRAPE_PROFILE, GRAPE_COLLECTION, GRAPE_COLLECTIONS_DATA, FEATURED_DAO_ARRAY } from '../utils/grapeTools/constants';

import {
    Grid,
    Button,
    ButtonGroup,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Typography,
} from '@mui/material';

import ShareSocialURL from '../utils/grapeTools/ShareUrl';
import { MakeLinkableAddress, ValidateAddress, trimAddress, timeAgo } from '../utils/grapeTools/WalletAddress'; // global key handling

import { CardActionArea } from '@mui/material';

import { useTranslation } from 'react-i18next';

export function FeaturedView(props: any) {
    const [verifiedCollectionArray, setVerifiedCollectionArray] = React.useState(null);
    const { t, i18n } = useTranslation();

    const fetchVerifiedCollection = async(address:string) => {
        try{
            const url = GRAPE_COLLECTIONS_DATA+'verified_collections.json';
            const response = await window.fetch(url, {
                method: 'GET',
                headers: {
                }
              });
              const string = await response.text();
              const json = string === "" ? {} : JSON.parse(string);
              //console.log(">>> "+JSON.stringify(json));
              setVerifiedCollectionArray(json); 
              return json;
            
        } catch(e){console.log("ERR: "+e)}
    }

    React.useEffect(() => { 
        fetchVerifiedCollection("");
    }, []);


    return (
        <Grid sx={{mt:6}}>
            {verifiedCollectionArray && verifiedCollectionArray.map((featured: any, key: number) => (
            <Card sx={{borderRadius:'26px',mb:2}}>
                <CardActionArea
                    component={Link} to={`${GRAPE_COLLECTION}${featured.vanityUrl}`}
                >
                    
                    <CardMedia
                        component="img"
                        image={GRAPE_COLLECTIONS_DATA+featured.splash}
                        alt={featured.name}
                            sx={{
                                maxHeight: '250',
                                background: 'rgba(0, 0, 0, 1)',
                                m:0,
                                p:0,
                            }} 
                        />
                        
                    <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {featured.name}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                        {featured.description}
                    </Typography>
                        <img
                            src={GRAPE_COLLECTIONS_DATA+featured.splash}
                            srcSet={GRAPE_COLLECTIONS_DATA+featured.splash}
                            alt=""
                            style={{
                                opacity: '0.025',
                                position: 'absolute',
                                marginTop:2,
                                marginBottom:2,
                                padding:1,
                                top:'-20%',
                                left:'-20%',
                                width:'150%'
                            }}
                        />
                    </CardContent>
                
                </CardActionArea>
                <CardActions>
                    <Grid 
                        container
                        direction="row"
                        justifyContent='flex-end'
                        alignContent='flex-end'
                        sx={{
                            p:1,pr:1.25
                        }}
                    >
                        <ButtonGroup variant="text">
                            {/*
                            <Button size="small" 
                                component="a" href={`${featured.daourl}`} target="_blank"
                                sx={{borderRadius:'24px', color:'white'}}>
                                {t('View DAO')}</Button>
                            */}
                            <Button size="small"    
                                component={Link} to={`${GRAPE_COLLECTION}${featured.vanityUrl}`}
                                sx={{borderRadius:'24px', color:'white'}}
                            >{t('View Collection')}</Button>
                            <ShareSocialURL url={'https://grape.art'+GRAPE_COLLECTION+featured.vanityUrl} title={`Collection: ${featured.name}`} />
                        </ButtonGroup>
                    </Grid>
                </CardActions>
            </Card> 
            ))}
        </Grid>
    );
    /* i.e. SOLANA DAO
    return (
        <Grid sx={{mt:6}}>
            {FEATURED_DAO_ARRAY.map((featured: any, key: number) => (
            <Card sx={{borderRadius:'26px',mb:2}}>
                <CardActionArea
                    component={Link} to={`${GRAPE_PROFILE}${featured.address}`}
                >
                    
                    <CardMedia
                        component="img"
                        image={featured.img}
                        alt={featured.title}
                            sx={{
                                maxHeight: '250',
                                background: 'rgba(0, 0, 0, 1)',
                                m:0,
                                p:0,
                            }} 
                        />
                        
                    <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {featured.title}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                        {featured.text}
                    </Typography>
                        <img
                            src={featured.img}
                            alt=""
                            style={{
                                opacity: '0.025',
                                position: 'absolute',
                                marginTop:2,
                                marginBottom:2,
                                padding:1,
                                top:'-20%',
                                left:'-20%',
                                width:'150%'
                            }}
                        />
                    </CardContent>
                
                </CardActionArea>
                <CardActions>
                    <Grid 
                        container
                        direction="row"
                        justifyContent='flex-end'
                        alignContent='flex-end'
                        sx={{
                            p:1,pr:1.25
                        }}
                    >
                        <ButtonGroup variant="text">
                            <Button size="small" 
                                component="a" href={`${featured.daourl}`} target="_blank"
                                sx={{borderRadius:'24px', color:'white'}}>
                                {t('View DAO')}</Button>
                            <Button size="small"    
                                component={Link} to={`${GRAPE_PROFILE}${featured.address}`}
                                sx={{borderRadius:'24px', color:'white'}}
                            >{t('View Collection')}</Button>
                            <ShareSocialURL url={'https://grape.art'+GRAPE_PROFILE+featured.address} title={'Grape Profile | '+trimAddress(featured.address,4)} />
                        </ButtonGroup>
                    </Grid>
                </CardActions>
            </Card> 
            ))}
        </Grid>
    );
    */
}